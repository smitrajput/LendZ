import pymongo


myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient["mydatabase"]

print(myclient.list_database_names())


mycol = mydb["customers"]
print(mydb.list_collection_names())


mydict = { "name": "John", "address": "Highway 36" }

x = mycol.insert_one(mydict)

print(x.inserted_id)
print (x)

for x in mycol.find():
  print(x)

for x in mycol.find({},{ "_id": 1, "address": 1 }):
  print(x)

myquery = { "address": "Highway 36" }

mydoc = mycol.find(myquery)

for x in mydoc:
  print(x)