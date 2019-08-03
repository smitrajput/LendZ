from fastapi import FastAPI
from pydantic import BaseModel
from enum import Enum
from loan_service import LoanService

class UserReg(BaseModel):
    user_name: str
    admin_user_name: str
    admin_private_key: bytes
    user_public_key: bytes


class AdminRole(str, Enum):
    master = "master"
    junior = "junior"
    basic = "basic"


class AdminReg(BaseModel):
    user_name: str
    role: AdminRole = AdminRole.basic
    admin_public_key: bytes
    super_admin_private_key: bytes



app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/kernel/")
async def store_kernel(req_data: dict):

    print ("post data received : ", req_data)
    stored = LoanService.store(req_data)
    response = stored
    return response

@app.get("/kernel/{kernel_id}")
async def get_kernel(kernel_id:str):

    response = LoanService.get_kernel(kernel_id)
    return response
    

