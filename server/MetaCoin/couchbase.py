import couchbase
import sys
sys.version
from couchbase.cluster import Cluster
# from couchbase.cluster import PasswordAuthenticator   
# from cbencryption import AES256CryptoProvider
# from couchbase.bucket import Bucket
# from couchbase.crypto import InMemoryKeyStore

# print "hello"
# print 9-3

# cluster = Cluster('couchbase://localhost:8091/')
# authenticator = PasswordAuthenticator("admin", "narutominato")
# cluster.authenticate(authenticator)
# cb = cluster.open_bucket('konaha')
# beer = cluster.open_bucket('beer-sample')

# public_key = '0x1774a26cd915da7dba26f1a6616f94af2bd8b963'
# private_key = '0x0d9201798302a63ff6c6b613c932090777ba224015bae51e70d7ba55040b778d'

# # create insecure key store and register both public and private keys
# keystore = InMemoryKeyStore()
# keystore.set_key('mypublickey', public_key)
# keystore.set_key('myprivatekey', private_key)

# # create and register provider
# provider = AES256CryptoProvider.AES256CryptoProvider(keystore, 'mypublickey', 'myprivatekey')
# # bucket = Bucket("couchbase://10.143.180.101:8091/default",password='password')
# cb.register_crypto_provider('AES-256-HMAC-SHA256', provider)

# # encrypt document, the alg name must match the provider name and the kid must match a key in the keystore
# prefix = '__crypt_'
# document = {'message': 'The old grey goose jumped over the wrickety gate.'}
# fieldspec = [{'alg': 'AES-256-HMAC-SHA256', 'name': 'message'}]
# encrypted_document = bucket.encrypt_fields(document,
#                                            fieldspec,
#                                            prefix)

# print encrypted_document

# expected = {
#     "__crypt_message": {"alg": "AES-256-HMAC-SHA256",
#                         "kid": "mypublickey",
#                         "ciphertext": "sR6AFEIGWS5Fy9QObNOhbCgfg3vXH4NHVRK1qkhKLQqjkByg2n69lot89qFEJuBsVNTXR77PZR6RjN4h4M9evg=="
#                         }
# }
