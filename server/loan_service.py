import pymongo
import json
from bson.objectid import ObjectId

class LoanService (object):

    @classmethod
    def store(cls, data):
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")
        mydb = myclient["mydatabase"]
        mycol = mydb["customers"]

        x = mycol.insert_one(data)
        mydoc = mycol.find_one({"_id":data["_id"]})
        mydoc["_id"] = str(mydoc["_id"])

        return {
            "message":"data stored",
            "data":mydoc
        }

    @classmethod
    def get_kernel(cls, id):
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")
        mydb = myclient["mydatabase"]
        mycol = mydb["customers"]
        print("doc id : ", id)
        mydoc = mycol.find_one({"_id":ObjectId(id)})
        print ("doc : ", mydoc)
        if (mydoc):
            mydoc["_id"] = str(mydoc["_id"])

            return {
                "message":"kernel successfully retrieved",
                "data":mydoc
            }
        else:
            return {
                "message":"there is no doc for the corresponding ID"
            }



# myclient = pymongo.MongoClient("mongodb://localhost:27017/")

# mydb = myclient["mydatabase"]

# print(myclient.list_database_names())


# mycol = mydb["customers"]
# print(mydb.list_collection_names())


# mydict = { "name": "John", "address": "Highway 36" }

# x = mycol.insert_one(mydict)

# print(x.inserted_id)
# print (x)

# for x in mycol.find():
#   print(x)

# for x in mycol.find({},{ "_id": 1, "address": 1 }):
#   print(x)

# myquery = { "address": "Highway 36" }

# mydoc = mycol.find(myquery)

# for x in mydoc:
#   print(x)