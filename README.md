<h1 align="center">LendZ</h1>
<p><h3 align="center">Confidential loans on Lendroid using the Aztec protocol.</h3></p>

#### Setting up the project locally
1. Type the following in your terminal/console:
```javascript
git clone https://github.com/smitrajput/LendZ.git
cd LendZ/server2
yarn install
npm start
```
2. In a new terminal/console, while still _inside the server2 directory_, type the following:
```javascript
cd ..
cd server
python3 eventListener.py
cd ..
cd client2
yarn install
npm start
```
