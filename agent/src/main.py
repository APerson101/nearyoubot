from typing import Union

from fastapi import FastAPI
from test import new_query
app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/query/{question}")
async def read_item(question: str):
    result=await new_query(question)
    return result 