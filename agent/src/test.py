from llama_index.core.query_pipeline import QueryPipeline, InputComponent
from typing import Dict, Any, List, Optional
from llama_index.llms.openai import OpenAI
from llama_index.core import Document, VectorStoreIndex
from llama_index.core import SummaryIndex
from llama_index.core.response_synthesizers import TreeSummarize
from llama_index.core.schema import NodeWithScore, TextNode
from llama_index.core import PromptTemplate
from llama_index.core.selectors import LLMSingleSelector
from google.cloud import bigquery
from near_schema import prompt
from llama_index.llms.vertex import Vertex
from google.oauth2 import service_account
from llama_index.core.llms import ChatMessage, MessageRole
filename = "blaze-d28fb-888da8e9564c.json"
credentials: service_account.Credentials = (
    service_account.Credentials.from_service_account_file(filename)
)
# Vertex(
#     model="text-bison", project=credentials.project_id, credentials=credentials
# )

llm = Vertex(model="gemini-1.5-pro", temperature=0, project=credentials.project_id, credentials=credentials, additional_kwargs={})
async def new_query(question_asked:str)->str:
    messages = [
        ChatMessage(role=MessageRole.SYSTEM, content=prompt),
        ChatMessage(role=MessageRole.USER, content=question_asked),]
    unfiltered_query=llm.chat(messages=messages).message.content
    sql_query_index = unfiltered_query.upper().find('SQLQUERY:')
    end_of_query = unfiltered_query.find(';')
    filtered_sql=''
    if sql_query_index != -1:
        filtered_sql= unfiltered_query[sql_query_index + 10:end_of_query].strip()
    print(filtered_sql)
    client = bigquery.Client(credentials=credentials)
    # Perform a query.
    QUERY = (filtered_sql)
    query_job = client.query(QUERY)  
    rows = query_job.result()
    rows_list = list(rows)
    reduced_list = rows_list[:500]
    json_output = [dict(row) for row in reduced_list]
    chat_prompt=f'''you are a data analysis expert here is the question the user asked: {question_asked} and here is the result {json_output}, summarise and make references to the data. 
    go straight to the point do not be verbose, use simple sentences. point out interesting things from the data when applicable'''
    answer=(await llm.acomplete(chat_prompt)).text
    return answer