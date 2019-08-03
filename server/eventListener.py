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
        # Create .env file path.
        # dotenv_path = join(dirname(__file__), '.env')
        # Load file from the path & store the environment variables
        # load_dotenv(dotenv_path)
        self.url = "http://localhost:8545/"
        self.walletSocketAddress = "0x35D8a615F9486647C41492c34d6B346Bf98f74bC"
        # self.walletSocketAddress = "0x61A73ba8253c304A0ccBb6809a424969F79D4FC7"

        # Connect Web3 to a provider & check connection
        self.web3 = Web3(HTTPProvider(self.url))
        if(not self.web3.isConnected()):
            print("ERROR: Unable to connect to blockchain")
            exit(0)

        # Create sockets to send information when different events are triggered
        # self.noteCreated_socket = self.__createZmqSocket("tcp://127.0.0.1:5555/")

        # Create signatures of events to subscribe to (these will be 'topic0' of the logs)
        self.noteCreated_event_signature = self.web3.sha3(text = "setVersionEvent(uint256)").hex()

    # Function to create a 0MQ Socket based on event type
    # def __createZmqSocket(self, eventType):
    #     context = zmq.Context()
    #     zmq_socket = context.socket(zmq.PUSH)
    #     zmq_socket.bind(eventType)
    #     return zmq_socket

    def __createEventFilter(self, contractAddress, eventSignature):
        return self.web3.eth.filter({
            "address": self.web3.toChecksumAddress(contractAddress),
            "topics": [eventSignature]
        })


    # Function to handle 'NoteCreated()' event
    def __handleNoteCreated(self, event_topics):
        # print("Asset Address:", "0x" + event_topics[1].hex()[26:])
        # print("Owner:", "0x" + event_topics[2].hex()[26:])
        # print("NoteHash:", event_topics[3].hex())
        print(event_topics)

        noteDetails = {
            "data":event_topics[1].hex()
            # "assetAddress": "0x" + event_topics[1].hex()[26:],
            # "owner": "0x" + event_topics[2].hex()[26:],
            # "noteHash": event_topics[3].hex()
        }
        data = noteDetails
        print ("post data ", noteDetails);
        r = requests.post('http://localhost:8000/kernel/', json = data)
        response = r.json()
        print ("resonse : ", response)
        # self.noteCreated_socket.send_json(noteDetails)

    # Function to handle all events subscribed to
    def __handle_event(self, event):
        if(event["topics"][0].hex() == self.noteCreated_event_signature):
            # print(event)
            self.__handleNoteCreated(event["topics"])


    async def __log_loop(self, event_filter, poll_interval):
        while True:
            # print("1");
            for event in event_filter.get_new_entries():
                self.__handle_event(event)
            await asyncio.sleep(poll_interval)
    
    # Start the listener service
    def startListener(self):
        # Create event filters for all events to be subscribed to
        noteCreatedEventFilter = self.__createEventFilter(self.walletSocketAddress, self.noteCreated_event_signature)

        loop = uvloop.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            loop.run_until_complete(
                asyncio.gather(
                    self.__log_loop(noteCreatedEventFilter, 2)
                )
            )
        finally:
            loop.close()


if __name__ == '__main__':
    listener = EventListener()
    listener.startListener()

