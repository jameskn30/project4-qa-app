from haystack import Pipeline, component
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack_integrations.components.generators.ollama import OllamaGenerator
from haystack.components.generators import OpenAIGenerator
from haystack.utils import Secret
from typing import List
from sentence_transformers import SentenceTransformer
import os
import logging
from pathlib import Path
from time import sleep

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


hf_token = False
groq_token = False

# Get the current file's directory
current_dir = Path(__file__).parent
secrets_path = current_dir / "secrets"

assert secrets_path.exists(), "secrets file not found"

OLLAMA_URL = os.environ.get('OLLAMA_URL','http://localhost')
OLLAMA_PORT = os.environ.get('OLLAMA_PORT','11434')

with open(secrets_path) as file:
    for line in file.readlines():
        key, value = line.strip().split("=")
        if key == 'HF_TOKEN':
            hf_token = True
            os.environ[key] = value
        elif key == 'GROQ_API_KEY':
            groq_token = True
            os.environ[key] = value
assert hf_token, 'HF_TOKEN not found'
assert groq_token, 'GROQ_API_KEY not found'

@component
class MessageCluster:
    """
    A component to cluster messages based on their embeddings.
    """

    def __init__(self, sent_transformer: SentenceTransformer, threshold: float = 0.5):
        self.sent_transformer = sent_transformer
        self.threshold = threshold

    @component.output_types(clusters=List[List[str]])
    def run(self, messages: List[str]):
        """
        Run the clustering algorithm on the provided messages.

        :param messages: List of messages to be clustered.
        :return: List of clusters, each cluster is a list of messages.
        """
        logger.info("Clustering messages")
        clusters = self._cluster_messages(messages, self.threshold)
        logger.info(f"Generated {len(clusters)} clusters")
        return clusters

    def _group_embeddings(self, sim_matrix, threshold):
        """
        Group embeddings based on similarity matrix and threshold.

        :param sim_matrix: Similarity matrix of embeddings.
        :param threshold: Threshold for grouping.
        :return: List of groups.
        """
        num_embeddings = sim_matrix.shape[0]
        visited = [False] * num_embeddings
        groups = []

        for i in range(num_embeddings):
            if not visited[i]:
                group = [i]
                visited[i] = True
                for j in range(num_embeddings):
                    if i != j and sim_matrix[i][j] >= threshold and not visited[j]:
                        group.append(j)
                        visited[j] = True
                groups.append(group)

        return groups

    def _cluster_messages(self, messages, threshold=0.5):
        """
        Cluster messages based on their embeddings.

        :param messages: List of messages to be clustered.
        :param threshold: Threshold for clustering.
        :return: List of clusters.
        """
        test_messages = messages.copy()
        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeds = model.encode(test_messages)
        sim_scores = model.similarity(embeds, embeds)
        groups = self._group_embeddings(sim_scores, threshold=threshold)
        clustered_messages = []

        for group in groups:
            clustered_messages.append([messages[i] for i in group])
        return clustered_messages


def rephrase_messages(messages, llm):
    """
    Rephrase messages into a concise and clear format using an LLM.

    :param messages: List of messages to be rephrased.
    :param llm: Language model to be used for rephrasing.
    :return: List of rephrased message groups.
    """
    logger.info("Rephrasing messages")

    template = '''
    Given the following messages:
    {{messages}}
    Rephrase these messages into 1 message that clarify the question and keep it concise and contain most important key questions. 
    You are rephrasing, you do not need to answer. If you don't have enough information, just return the original message
    Just give the final message with no explanation and extra information.
    '''

    MAX_RUN = 10

    # component
    prompt_template = PromptBuilder(template=template)
    pipe = Pipeline(max_runs_per_component=MAX_RUN)
    pipe.add_component('prompt', prompt_template)
    pipe.add_component('llm', llm)

    # make connection
    pipe.connect('prompt', 'llm')

    # run pipeline
    model = SentenceTransformer("all-MiniLM-L6-v2")
    cluster = MessageCluster(sent_transformer=model, threshold=0.6)
    groups = cluster.run(messages)

    rephrase_groups = []

    for group in groups:
        try:
            res = pipe.run({'prompt': {'messages': group}})
            if len(group) > 1:
                rephrase = res['llm']['replies']
            else:
                rephrase = group
            rephrase_groups.append(rephrase)
            logger.info(f"Rephrased group: {rephrase}")
        except Exception as e:
            logger.error(f"Error rephrasing group {group}: {e}")
            # Fallback to original group in case of error
            rephrase_groups.append(group[0])  
        # this prevents 429, too many requests from GroqAPI 
        sleep(0.5)

    logger.info("Rephrasing completed")
    return rephrase_groups


def load_groq_llm():
    """
    Load the Groq language model.

    :return: Groq language model.
    """
    logger.info("Loading Groq LLM")
    MODEL_GROQ = 'llama-3.2-3b-preview'
    groq = OpenAIGenerator(
        api_key=Secret.from_env_var("GROQ_API_KEY"),
        api_base_url="https://api.groq.com/openai/v1",
        model=MODEL_GROQ,
        generation_kwargs={"max_tokens": 512}
    )
    logger.info("Groq LLM loaded")
    return groq

def load_ollama_llm():
    #This for local testing without stressing the GroqAPI
    MODEL = 'llama3.2:3b'
    llm = OllamaGenerator(model = MODEL, url=f"{OLLAMA_URL}:{OLLAMA_PORT}") 
    return llm
