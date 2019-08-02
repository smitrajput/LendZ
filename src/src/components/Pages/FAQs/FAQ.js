export const FAQContents = [
  {
    title: 'General FAQs',
    contents: [
      [
        'What is a P2P lending?',
        `P2P lending in crypto is a loan agreement on a Smart Contract between a lender who has digital assets with a borrower who needs them. The terms are mutually agreed and committed on the blockchain. The funds are disbursed directly, without any third party taking custody of them.`
      ],
      [
        `How are borrowers and lenders matched?`,
        `Borrowers and lenders are matched via a user interface which displays all available lend orders and borrow orders. Users can then either choose to fill an available order, or create one of their own.`
      ],
      [
        `How is this different from a conventional bank loan?`,
        `It is peer to peer; there is no institution involved in the transaction. There is no central custodian of funds. Security in the process is assured by mutually committing to the terms of the loan on a smart contract.`
      ],
      [
        `Is this an exchange for crypto currency?`,
        `No it is not. It facilitates the matching of orders between lender and borrowers, and for other off-chain players to be incentivised to monitor the health of the loan. There is no central custodianship of anyone’s funds.`
      ],
      [
        `What is the purpose of setting up P2P lending for crypto assets?`,
        `The crypto space is still evolving and has only a limited range of financial instruments. Those who have digital assets typically earn simply by holding on to them and hoping for their value to increase. P2P lending is meant to increase liquidity in this space by encouraging holders to lend and earn interest against their digital assets. It also provides an alternative means of getting digital assets instead of buying them outright in an exchange.`
      ],
      [
        `What are the fees for using the platform?`,
        `The platform is non-rent-seeking. There are no fees per se for using Reloanr. However, service providers on the platform are free to charge for any services that they provide - like matching loan orders, or monitoring the health of a loan.`
      ],
      [
        `What cryptocurrencies are accepted on the platform?`,
        `Version 1 of Reloanr supports Dai, wrapped ETH, DGD and USDC. Typical collateral - loan currency combos would be WETH for Dai, DGD for USDC and Dai for USDC. In subsequent versions, more digital assets like Digix will be included. Any ERC20 token can potentially be listed as a loan currency or as collateral.`
      ],
      [
        `What do I need to begin using Reloanr?`,
        `A browser-enabled crypto wallet (Metamask is ideal) to begin with. If you want to lend, you need loan currency and if you want to borrow, you need sufficient collateral. Whatever the role, you will need some LST to pay fees to the service providers on the platform. To find out how to get organised for Reloanr, please refer to the user manual.`
      ],
      [
        `What is LST? What is its utility on the platform?`,
        `LST stands for Lendroid Support Token, the native token of the Lendroid Protocol. On Reloanr, it is used as fees paid to service providers. It is a utility token. For an understanding of utility tokens, please see this blog. All lenders and borrowers need LST to participate on the platform, to pay relayers and wranglers.`
      ],
      [
        `How is Reloanr organised? Who are the participants on Reloanr?`,
        `There are four key players on Reloanr. Those are in brief - <br/>
        <ul>
          <li><strong>Relayer</strong> - A familiar participant in the decentralized trading ecosystem. Provides a smooth, off-chain interface to the instrument of your choice.</li>
          <li><strong>Lender</strong> - Holder of DAI, source of liquidity. He gets to lend his digital asset and earn a low risk interest on it. The interest is pre-determined and off chain actors are incentivized to monitor loan health and trigger liquidation if it comes to that.</li>
          <li><strong>Borrower</strong> - Borrowers have a secondary source for digital assets at a presumably lower interest rate. The mechanics of borrowing are more or less the same - define terms, create loan contract, execute - with added layers of authenticating the loan and monitoring its health.</li>
          <li><strong>Wrangler</strong> - Exclusive to the Lendroid ecosystem. An off-chain entity incentivised to, authorize orders, monitor active loans, and trigger liquidation where applicable.</li>
        </ul>`
      ]
    ]
  },
  {
    title: `FAQs about using ReloanR`,
    contents: [
      [
        `Is there a user manual for Reloanr I can refer to?`,
        `Yes. The manual describes what you need to participate on the platform, how to get it, and how to participate as a Lender, Borrower, Relayer or Wrangler. You can access the user manual at this link.`
      ],
      [
        `Who can use ReloanR?`,
        `Those who want to earn interest on their digital assets can participate as Lenders; those who want to borrow digital assets can be borrowers, those who want to match orders can set up their own UI, and those who want to offer loan monitoring and authentication services can run the wrangler server.`
      ],
      [
        `Is there a registration or KYC needed to use Reloanr?`,
        `There is no need to register to use Reloanr. There is no KYC process, since Reloanr does not hold or disburse funds. You can log in to your metamask and begin participating on the platform.`
      ],
      [
        `How much can I borrow?`,
        `There is no limit to how much you can borrow. If you have sufficient collateral to back your loan, and there are takers for your order, lenders will fill your loan.`
      ],
      [
        `How much can I lend?`,
        `There is no limit to how much you can lend. You can lend any amount of digital assets on the platform, for an interest rate of your choosing. If there are interested borrowers, they will fill your order either partially or in full.`
      ],
      [
        `How much collateral do I need to put in?`,
        `The collateral limit is set by the wrangler; and the level is dependent on market rates of the token. In the simple version of the wrangler, setting aside collateral equivalent to the loan amount is sufficient.`
      ],
      [
        `What part of the loan order can I customize?`,
        `You can customise the loan amount, the interest rate, the loan term, the duration of a particular loan offer, and the fee for the relayer and the wrangler for the services they provide on the platform. You can also set an allowance on WETH, Dai and LST - practically limiting access to the smart contract to your funds.`
      ],
      [
        `Is the interest rate charged only on the amount borrowed, or does it compound?`,
        `The interest rate is fixed, charged on the amount borrowed, without any compound interest.`
      ],
      [
        `Do you use any price feed oracles to decide on token prices?`,
        `For Dai, we use Maker’s specialised Medianizer price feed. For the rest, the rates are pulled in from Coinmarketcap. Users are free to recommend alternative price feeds.`
      ],
      [
        `If I accept a loan order, how soon will the funds be credited to my wallet?`,
        `If the order goes through, the funds are transferred to the borrower’s account immediately by the smart contract.`
      ],
      [
        `When do the loans start and end?`,
        `Loans start and end as defined in the order, and as agreed mutually between the lender and the borrower.`
      ],
      [
        `Can a loan order be cancelled?`,
        `A loan order can be cancelled if it has not been filled. If it is filled, it can be closed by a borrower by repaying the loan. The lender does not have the option of closing a loan prematurely. He will have to wait until it matures.`
      ],
      [
        `If my collateral value is dipping, can I top up collateral?`,
        `A borrower can choose to top up his collateral at any time. The loan health is monitored and a near-real-time feed is made available on the UI. Based on loan health percentage, the borrower may choose to top up collateral.`
      ],
      [
        `If my collateral value is over the necessary limit, can I withdraw collateral?`,
        `In version 1, it is not possible to withdraw excess collateral. This is likely to be enabled in subsequent versions.`
      ],
      [
        `Can I choose to refinance/rollover the loan if it is close to expiry?`,
        `As of version 1, rollover or refinancing of loan is not possible. It will be enabled in subsequent versions.`
      ],
      [
        `What if the loan is not repaid on time?`,
        `If the loan is not repaid by the stipulated time, the collateral will be liquidated in full and be sent to the lender’s wallet automatically.`
      ],
      [
        `Can I repay the loan earlier than the given time?`,
        `A borrower can close the loan at any time by repaying the loan. The repayment will, of course, include the interest applicable at the time of repayment.`
      ],
      [
        `Do I need to pay taxes on the interest earned as a lender?`,
        `This is subject to the taxation rules of the country you belong to. Please consult a subject matter expert to make sure of your tax liabilities.`
      ],
      [
        `What are the charges for borrowers?`,
        `There are no charges from the platform or from the foundation. The relayer and wrangler might charge fees in LST for the services they provide. The borrower will also pay interest on his loan.`
      ],
      [
        `What are the charges for Lenders?`,
        `There are no charges from the platform or from the foundation. The relayer and wrangler might charge fees in LST for the services they provide.`
      ],
      [
        `How do relayers and wranglers earn on the platform?`,
        `They earn through the fees they charge from lenders and borrowers for the services they provide.`
      ],
      [
        `What is my risk as a lender?`,
        `On Reloanr, the lender is a protected entity. The possible risk is defaulting on the loan by the borrower, in which case the collateral will be liquidated and sent to the lender’s wallet. There is the risk of a technical error which might result in loss of funds, or a black swan event which hits the value of the collateral or of the loan currency.`
      ],
      [
        `What is my risk as a borrower?`,
        `Liquidation of collateral is a primary risk for the borrower, in the event that he is unable to repay the loan within the stipulated time. The other risk is a sudden dip in the value of his collateral due to market forces. In this case, the loan health falls and collateral is liquidated.`
      ],
      [
        `How do I become a Relayer?`,
        `The relayer UI is highly customizable. You can deploy your version of the UI from the available code on Lendroid’s Github.`
      ],
      [
        `How do I become a Wrangler?`,
        `You will need to run a Wrangler server. Write in to <a href="mailto:connect@lendroid.com"> connect@lendroid.com </a> for additional details and a more comprehensive manual.`
      ],
      [
        `In case of a technical error, who do I contact?`,
        `Please write to <a href="mailto:connect@lendroid.com"> connect@lendroid.com </a>`
      ]
    ]
  },
  {
    title: `Regulatory FAQs`,
    contents: [
      [
        `Is ReloanR a custodian of funds - loan collateral, loan amount, etc.?`,
        `No. Reloanr only provides the platform for lenders and borrowers to discover each other. In this initial version, it also deploys a simple wrangler to authenticate loan contracts and in case of certain conditions, liquidate collateral. Transactions are peer to peer, the funds never pass through Reloanr.`
      ],
      [
        `Is ReloanR regulated by the Monetary Authority of Singapore (MAS)?`,
        `No it is not. It is a proof of concept for a blockchain-based financial instrument.`
      ]
    ]
  }
]
