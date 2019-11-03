<h1 align="center">zkLoans</h1>
<p align="center">Confidential (zero-knowledge) loans on the Ethereum blockchain using Lendroid and the Aztec protocol [LendZ @ETHIndia2.0]</p>


### Problem it solves
Lending on the blockchain promises to be a revolution in the DeFi space, in terms of bringing in business value and fulfilling people's financial needs. But there is one little loophole in the current lending space in DeFi. Since the end-to-end process is on the blockchain, along with decentralization and immutability, comes _transparency_, which is not always very desirable when it comes to lending/borrowing crypto. This has more viability when the lending/borrowing amounts are large, as _not always the lender wants the general public to know the amount (s)he's wishing to lend, to create some personal business value_. This is precisely the pain point where zkLoans can turn out to be life saviours. 

### Solution
zkLoans can be used to make confidential  loans on the blockchain, meaning the **amount** of the loan would be hidden, though the involved participants' addresses would be visible. Lending would be done on the **Lendroid protocol** and the loan amounts would be obscured by zero knowledge proofs implemented using the  **Aztec protocol**. The project would be deployed on **Matic-chain**. Name-address and reverse resolutions implemented using **ENS**, and **Torus** authentication to improve the overall UX of the dapp. 
 
### Value zkLoans will add to the Ethereum ecosystem 
1. They would bring in _much needed_ privacy to on-chain lending. 
2. They would have huge value for business magnates looking to make significantly large lending/borrowing transactions on the blockchain. 
3. The project would be a major push to quality lending/borrowing in the DeFi space. 

### Key features [WIP]
1. Lenders can create loans on Lendroid with it's _amount_ value being shown only in a range, and not the _exact_ one.
2. Borrowers can make _View Requests_ to lend orders they are interested in.
3. Lenders can approve/disapprove View Requests from interested borrowers.
4. The lending amount from the lender Allen to the borrower Rob will be visible to **none**, but the two of them. Rob must repay the loan with interest, after depositing the required collateral.
5. If Rob defaults, the collateral would be used to compensate for Allen's loan amount, and the remaining would be returned to Rob.


### Setting up the project locally
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
