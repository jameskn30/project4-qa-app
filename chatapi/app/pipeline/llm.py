from haystack import Pipeline, component
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack_integrations.components.generators.ollama import OllamaGenerator
from haystack.dataclasses import ChatMessage
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
from pprint import pprint
from sentence_transformers import SentenceTransformer
import os

hf_token = False 
with open("secrets") as file:
    for line in file.readlines():
        key,value = line.strip().split("=")
        if key == 'HF_TOKEN':
            hf_token = True
            os.environ[key]=value
assert hf_token, 'HF_TOKEN not found'


@component
class MessageCluster:
    def __init__(self, sent_transformer: SentenceTransformer, threshold: float = 0.5):
        self.sent_transformer = sent_transformer
        self.threshold = threshold
    
    @component.output_types(clusters = List[List[str]])
    def run(self, messages: List[str]):
            clusters = self._cluster_messages(messages, self.threshold)
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

    def _cluster_messages(self, messages, threshold = 0.5):
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
  template = '''
    Given the following messages:
    {{messages}}
    Rephrase these messages into 1 message that clarify the question and keep it consise and contain most important key questions. 
    Just give the final message with no explanation and extra information.
    If you don't have enough information or the question is unclear, return 1 original message that makes the most sense.
  '''

  MAX_RUN = 10

  #component
  prompt_template = PromptBuilder(template=template)
  pipe = Pipeline(max_runs_per_component=MAX_RUN)
  pipe.add_component('prompt', prompt_template)
  pipe.add_component('llm', llm)

  #make connection
  pipe.connect('prompt', 'llm')

  #run pipeline
  model = SentenceTransformer("all-MiniLM-L6-v2")
  cluster = MessageCluster(sent_transformer=model, threshold=0.6)
  groups = cluster.run(messages)

  rephrase_groups = []

  for group in groups:
    res = pipe.run({'prompt': {'messages': group}})
    if len(group) > 1:
      rephrase = res['llm']['replies']
    else:
      rephrase = group
    rephrase_groups.append(rephrase)

  return rephrase_groups
