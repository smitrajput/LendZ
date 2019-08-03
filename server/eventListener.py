import os
from os.path import join, dirname
from dotenv import load_dotenv
from web3 import Web3, HTTPProvider
import asyncio
import uvloop
import zmq
import requests
##################################################################################################

class EventListener:


    def __init__(self):

        self.url = "http://localhost:8545/"
        self.ZkLoansAddress = "TBD"
        # self.ZkLoansAddress = "0x61A73ba8253c304A0ccBb6809a424969F79D4FC7"

        # Connect Web3 to a provider & check connection
        self.web3 = Web3(HTTPProvider(self.url))
        if(not self.web3.isConnected()):
            print("ERROR: Unable to connect to blockchain")
            exit(0)

        # Create sockets to send information when different events are triggered
        # self.noteCreated_socket = self.__createZmqSocket("tcp://127.0.0.1:5555/")

        # Create signatures of events to subscribe to (these will be 'topic0' of the logs)
        self.borrowerAccessRequested_event_signature = self.web3.sha3(text = "BorrowerAccessRequested(bytes32,address,bytes)").hex()
        self.borrowerAccessGranted_event_signature = self.web3.sha3(text = "BorrowerAccessGranted(bytes32,address)").hex()


    def __createEventFilter(self, contractAddress, eventSignature):
        return self.web3.eth.filter({
            "address": self.web3.toChecksumAddress(contractAddress),
            "topics": [eventSignature]
        })


    # Function to handle 'BorrowAccessRequested()' event
    def __handleBorrowAccessRequested(self, event_topics):
        print(event_topics)

        data = {
            "kernelHash": event_topics[1].hex(),
            "borrower": "0x" + event_topics[2].hex()[26:],
            "pubKey": ""
        }
        print ("post data: ", data);
        r = requests.post('http://localhost:8000/kernel/accessRequested', json = data)
        response = r.json()
        print ("resonse : ", response)

    # Function to handle 'BorrowAccessGranted()' event
    def __handleBorrowAccessGranted(self, event_topics):
        print(event_topics)

        data = {
            "kernelHash": event_topics[1].hex(),
            "borrower": "0x" + event_topics[2].hex()[26:]
        }
        print ("post data: ", data);
        r = requests.post('http://localhost:8000/kernel/accessGranted', json = data)
        response = r.json()
        print ("resonse : ", response)

    # Function to handle all events subscribed to
    def __handle_event(self, event):
        if(event["topics"][0].hex() == self.borrowAccessRequested_event_signature):
            # print(event)
            self.__handleBorrowAccessRequested(event["topics"])
        else if(event["topics"][0].hex() == self.borrowAccessGranted_event_signature):
            # print(event)
            self.__handleBorrowAccessGranted(event["topics"])


    async def __log_loop(self, event_filter, poll_interval):
        while True:
            # print("1");
            for event in event_filter.get_new_entries():
                self.__handle_event(event)
            await asyncio.sleep(poll_interval)
    
    # Start the listener service
    def startListener(self):
        # Create event filters for all events to be subscribed to
        borrowAccessRequestedEventFilter = self.__createEventFilter(self.ZkLoansAddress, self.borrowAccessRequested_event_signature)
        borrowAccessGrantedEventFilter = self.__createEventFilter(self.ZkLoansAddress, self.borrowAccessGranted_event_signature)

        loop = uvloop.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            loop.run_until_complete(
                asyncio.gather(
                    self.__log_loop(borrowAccessRequestedEventFilter, 2),
                    self.__log_loop(borrowAccessGrantedEventFilter, 2)
                )
            )
        finally:
            loop.close()


if __name__ == '__main__':
    listener = EventListener()
    listener.startListener()

