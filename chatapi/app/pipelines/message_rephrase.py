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

OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost')
OLLAMA_PORT = os.environ.get('OLLAMA_PORT', '11434')

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

    def __init__(self, sent_transformer: SentenceTransformer, threshold: float = 0.5):
        self.sent_transformer = sent_transformer
        self.threshold = threshold

    @component.output_types(clusters=List[List[str]])
    def run(self, messages1: List[str], messages2: List[str]):
        clusters = self._cluster_messages(messages1, messages2, self.threshold)
        return clusters

    def _group_embeddings(self, sim_matrix, threshold):

        num_embeddings = sim_matrix.shape[0]
        visited = [False] * num_embeddings
        groups = []

        for i in range(num_embeddings):
            if not visited[i]:
                # sorted_row = sorted(sim_matrix[i], reverse=True)
                group = [i]
                visited[i] = True
                for j in range(num_embeddings):
                    if i != j and sim_matrix[i][j] >= threshold and not visited[j]:
                        group.append(j)
                        visited[j] = True
                groups.append(group)

        return groups

    def _cluster_messages(self, messages1, messages2=None, threshold=0.5):

        model = SentenceTransformer("all-MiniLM-L6-v2")

        embeds1 = model.encode(messages1)
        if messages2 != None:
            embeds2 = model.encode(messages2)
        else:
            embeds2 = embeds1

        sim_scores = model.similarity(embeds1, embeds2)

        groups = self._group_embeddings(sim_scores, threshold=threshold)

        clustered_messages = []

        for group in groups:
            clustered_messages.append([messages1[i] for i in group])
        return clustered_messages


def rephrase_messages(messages1, llm, messages2 = None):
    """
    Rephrase messages into a concise and clear format using an LLM.

    :param messages: List of messages to be rephrased.
    :param llm: Language model to be used for rephrasing.
    :return: List of rephrased message groups.
    """
    logger.info("Rephrasing messages")

    template = '''
    Rephrase the following messages into a single message that captures the essence of the conversation. Do not answer the anything. Do not add any extra information
    {{messages}}
    '''

    # component
    prompt_template = PromptBuilder(template=template)
    pipe = Pipeline()
    pipe.add_component('prompt', prompt_template)
    pipe.add_component('llm', llm)

    # make connection
    pipe.connect('prompt', 'llm')

    # run pipeline
    model = SentenceTransformer("all-MiniLM-L6-v2")
    cluster = MessageCluster(sent_transformer=model, threshold=0.6)
    groups = cluster.run(messages1, messages2)

    rephrase_groups = []

    for group in groups:
        res = pipe.run({'prompt': {'messages': ','.join(group)}})
        if len(group) > 1:
            rephrase = res['llm']['replies'][0]
        else:
            rephrase = group[0]
        rephrase_groups.append(rephrase)

    # build pipeline
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
    # This for local testing without stressing the GroqAPI
    MODEL = 'llama3.2:3b'
    llm = OllamaGenerator(model=MODEL, url=f"{OLLAMA_URL}:{OLLAMA_PORT}")
    return llm
