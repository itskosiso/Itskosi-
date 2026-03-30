import { Question, Lesson } from './types';

export const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'What is Bitcoin?',
    points: 5,
    content: `
# What is Bitcoin?

Bitcoin is the world's first decentralized digital currency. Unlike traditional money, it isn't controlled by any central bank or government.

### Key Features:
- **Decentralized**: No central authority.
- **Limited Supply**: Only 21 million Bitcoins will ever exist.
- **Secure**: Uses blockchain technology to prevent fraud.

Bitcoin was created in 2009 by an anonymous person or group known as **Satoshi Nakamoto**.
    `,
  },
  {
    id: '2',
    title: 'What is a Wallet?',
    points: 5,
    content: `
# What is a Crypto Wallet?

A crypto wallet is a tool that allows you to interact with the blockchain. It doesn't actually "store" your coins; instead, it stores the **private keys** that give you access to your coins on the blockchain.

### Types of Wallets:
- **Hot Wallets**: Connected to the internet (e.g., mobile apps).
- **Cold Wallets**: Offline storage (e.g., hardware devices like USB sticks).

**Remember**: If you lose your private keys, you lose your crypto!
    `,
  },
  {
    id: '3',
    title: 'Crypto Safety Basics',
    points: 5,
    content: `
# Crypto Safety Basics

Staying safe in the crypto world is your top priority. Since there are no banks to call if something goes wrong, you are your own bank.

### Golden Rules:
- **Never share your private keys** or seed phrases.
- **Avoid fake giveaways** on social media.
- **Verify links** before clicking or connecting your wallet.
- **If it sounds too good to be true, it is a scam.**

Always use Two-Factor Authentication (2FA) on your accounts.
    `,
  },
  {
    id: '4',
    title: 'What is Blockchain?',
    points: 5,
    content: `
# What is Blockchain?

A blockchain is a digital, decentralized ledger that records all transactions across a network of computers.

### How it Works:
- **Blocks**: Transactions are grouped into blocks.
- **Chains**: Each block is linked to the previous one, forming a chain.
- **Immutable**: Once a block is added, it cannot be changed.

This technology makes crypto secure and transparent without needing a middleman like a bank.
    `,
  },
  {
    id: '5',
    title: 'What is Ethereum?',
    points: 5,
    content: `
# What is Ethereum?

Ethereum is a global, decentralized software platform powered by blockchain technology. It's most commonly known for its native cryptocurrency, **Ether (ETH)**.

### Key Features:
- **Smart Contracts**: Self-executing contracts with the terms directly written into code.
- **DApps**: Decentralized applications that run on the Ethereum network.
- **Programmable**: Developers can build new tools and tokens on top of it.

While Bitcoin is "digital gold," Ethereum is often called a "world computer."
    `,
  },
  {
    id: '6',
    title: 'What are Stablecoins?',
    points: 5,
    content: `
# What are Stablecoins?

Stablecoins are cryptocurrencies designed to have a stable price, usually pegged to a traditional currency like the US Dollar.

### Why use them?
- **Low Volatility**: Unlike Bitcoin, their price doesn't swing wildly.
- **Trading**: Used as a safe haven during market crashes.
- **Payments**: Easier to use for everyday purchases.

Common examples include **USDC**, **USDT**, and **DAI**.
    `,
  },
  {
    id: '7',
    title: 'What is DeFi?',
    points: 5,
    content: `
# What is DeFi?

DeFi stands for **Decentralized Finance**. it's a movement that aims to recreate traditional financial systems (like loans and insurance) using blockchain technology.

### Benefits:
- **Open to All**: No need for a bank account or credit check.
- **Transparent**: All transactions are visible on the blockchain.
- **Non-Custodial**: You keep control of your funds at all times.

DeFi allows you to earn interest, trade assets, and borrow money directly from other users.
    `,
  },
];

export const QUIZ_POOL: Question[] = [
  { id: 'q1', category: 'Bitcoin Basics', question: 'What is Bitcoin?', A: 'A cryptocurrency', B: 'A bank', C: 'A website', correct: 'A' },
  { id: 'q2', category: 'Bitcoin Basics', question: 'Who created Bitcoin?', A: 'Elon Musk', B: 'Satoshi Nakamoto', C: 'Vitalik Buterin', correct: 'B' },
  { id: 'q3', category: 'Bitcoin Basics', question: 'What is the maximum supply of Bitcoin?', A: '100 Million', B: '21 Million', C: 'Unlimited', correct: 'B' },
  { id: 'q4', category: 'Security & Wallets', question: 'What does a crypto wallet store?', A: 'Digital coins', B: 'Private keys', C: 'Bank account details', correct: 'B' },
  { id: 'q5', category: 'Security & Wallets', question: 'Which wallet is considered more secure?', A: 'Hot Wallet', B: 'Cold Wallet', C: 'Exchange Wallet', correct: 'B' },
  { id: 'q6', category: 'Security & Wallets', question: 'What should you do if someone asks for your seed phrase?', A: 'Give it to them', B: 'Never share it', C: 'Ask for their ID first', correct: 'B' },
  { id: 'q7', category: 'Blockchain Technology', question: 'What is a blockchain?', A: 'A physical chain of blocks', B: 'A decentralized digital ledger', C: 'A type of bank vault', correct: 'B' },
  { id: 'q8', category: 'Crypto Terminology', question: 'What is "HODL"?', A: 'A type of coin', B: 'A slang for holding crypto', C: 'A crypto exchange', correct: 'B' },
  { id: 'q9', category: 'Ethereum & Smart Contracts', question: 'What is Ethereum?', A: 'A Bitcoin clone', B: 'A platform for smart contracts', C: 'A social media site', correct: 'B' },
  { id: 'q10', category: 'Security & Wallets', question: 'What is a "Scam"?', A: 'A legitimate investment', B: 'A fraudulent scheme', C: 'A new cryptocurrency', correct: 'B' },
  { id: 'q11', category: 'Crypto Terminology', question: 'What is a "Stablecoin"?', A: 'A coin with high volatility', B: 'A coin pegged to a stable asset', C: 'A coin that never moves', correct: 'B' },
  { id: 'q12', category: 'Blockchain Technology', question: 'What is "Mining" in crypto?', A: 'Digging for gold', B: 'Validating transactions', C: 'Searching for lost wallets', correct: 'B' },
  { id: 'q13', category: 'Ethereum & Smart Contracts', question: 'What is a "Smart Contract"?', A: 'A legal document', B: 'Self-executing code on blockchain', C: 'A contract signed by AI', correct: 'B' },
  { id: 'q14', category: 'DeFi & Trading', question: 'What is "DeFi"?', A: 'Definitive Finance', B: 'Decentralized Finance', C: 'Delayed Finance', correct: 'B' },
  { id: 'q15', category: 'Crypto Terminology', question: 'What is an "NFT"?', A: 'New Financial Tool', B: 'Non-Fungible Token', C: 'Near Field Token', correct: 'B' },
  { id: 'q16', category: 'Ethereum & Smart Contracts', question: 'What is a "Gas Fee"?', A: 'Fuel for a car', B: 'Transaction fee on Ethereum', C: 'A fee for using a website', correct: 'B' },
  { id: 'q17', category: 'Crypto Terminology', question: 'What is "FOMO"?', A: 'Fear of Missing Out', B: 'Fast Online Money Order', C: 'Future of Market Options', correct: 'A' },
  { id: 'q18', category: 'Crypto Terminology', question: 'What is a "Bull Market"?', A: 'Prices are falling', B: 'Prices are rising', C: 'Market is closed', correct: 'B' },
  { id: 'q19', category: 'Crypto Terminology', question: 'What is a "Bear Market"?', A: 'Prices are rising', B: 'Prices are falling', C: 'Market is stable', correct: 'B' },
  { id: 'q20', category: 'Blockchain Technology', question: 'What is "Staking"?', A: 'Betting on a race', B: 'Locking coins to support network', C: 'Selling all your coins', correct: 'B' },
  { id: 'q21', category: 'Security & Wallets', question: 'What is a "Private Key"?', A: 'A password for your email', B: 'A secret code to access crypto', C: 'A key to your house', correct: 'B' },
  { id: 'q22', category: 'Security & Wallets', question: 'What is a "Public Key"?', A: 'Your home address', B: 'Your crypto wallet address', C: 'A key everyone can use', correct: 'B' },
  { id: 'q23', category: 'Bitcoin Basics', question: 'What is "Satoshi"?', A: 'A type of sushi', B: 'The smallest unit of Bitcoin', C: 'A crypto exchange', correct: 'B' },
  { id: 'q24', category: 'Crypto Terminology', question: 'What is "Altcoin"?', A: 'Alternative to Bitcoin', B: 'A coin made of aluminum', C: 'A coin that is old', correct: 'A' },
  { id: 'q25', category: 'Crypto Terminology', question: 'What is "Whale" in crypto?', A: 'A large sea animal', B: 'An investor with huge holdings', C: 'A slow transaction', correct: 'B' },
  { id: 'q26', category: 'Crypto Terminology', question: 'What is "Airdrop"?', A: 'Dropping a phone', B: 'Free distribution of tokens', C: 'A type of cloud storage', correct: 'B' },
  { id: 'q27', category: 'Crypto Terminology', question: 'What is "Whitepaper"?', A: 'A blank piece of paper', B: 'A document explaining a project', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q28', category: 'Blockchain Technology', question: 'What is "DAO"?', A: 'Digital Asset Organization', B: 'Decentralized Autonomous Organization', C: 'Direct Access Online', correct: 'B' },
  { id: 'q29', category: 'DeFi & Trading', question: 'What is "DEX"?', A: 'Digital Exchange', B: 'Decentralized Exchange', C: 'Direct Exchange', correct: 'B' },
  { id: 'q30', category: 'DeFi & Trading', question: 'What is "CEX"?', A: 'Centralized Exchange', B: 'Crypto Exchange', C: 'Common Exchange', correct: 'A' },
  { id: 'q31', category: 'Security & Wallets', question: 'What is "Cold Storage"?', A: 'Keeping crypto in a fridge', B: 'Keeping crypto offline', C: 'A type of frozen asset', correct: 'B' },
  { id: 'q32', category: 'Security & Wallets', question: 'What is "Hot Wallet"?', A: 'A wallet that is popular', B: 'A wallet connected to internet', C: 'A wallet that is overheating', correct: 'B' },
  { id: 'q33', category: 'Bitcoin Basics', question: 'What is "Halving" in Bitcoin?', A: 'Cutting a coin in half', B: 'Reducing block rewards by 50%', C: 'Splitting the blockchain', correct: 'B' },
  { id: 'q34', category: 'Bitcoin Basics', question: 'What is "Hash Rate"?', A: 'Speed of internet', B: 'Total computational power of network', C: 'A type of crypto tax', correct: 'B' },
  { id: 'q35', category: 'Crypto Terminology', question: 'What is "ICO"?', A: 'Initial Coin Offering', B: 'International Crypto Office', C: 'Instant Cash Out', correct: 'A' },
  { id: 'q36', category: 'Crypto Terminology', question: 'What is "Lambo" slang for?', A: 'A type of lamb', B: 'Success in crypto trading', C: 'A slow transaction', correct: 'B' },
  { id: 'q37', category: 'Crypto Terminology', question: 'What is "Mooning"?', A: 'Looking at the moon', B: 'Price rising rapidly', C: 'A type of night trading', correct: 'B' },
  { id: 'q38', category: 'Crypto Terminology', question: 'What is "Rekt"?', A: 'A type of coin', B: 'Suffering a heavy loss', C: 'Winning a trade', correct: 'B' },
  { id: 'q39', category: 'Crypto Terminology', question: 'What is "Shilling"?', A: 'A British coin', B: 'Promoting a coin for personal gain', C: 'Buying a coin', correct: 'B' },
  { id: 'q40', category: 'Crypto Terminology', question: 'What is "Vaporware"?', A: 'A project with no product', B: 'A type of cloud computing', C: 'A fast transaction', correct: 'A' },
  { id: 'q41', category: 'Blockchain Technology', question: 'What is "Web3"?', A: 'The third version of Google', B: 'Decentralized internet on blockchain', C: 'A type of web browser', correct: 'B' },
  { id: 'q42', category: 'DeFi & Trading', question: 'What is "Yield Farming"?', A: 'Growing crops with crypto', B: 'Earning rewards by providing liquidity', C: 'Selling farm products for crypto', correct: 'B' },
  { id: 'q43', category: 'Security & Wallets', question: 'What is "2FA"?', A: 'Two-Factor Authentication', B: 'Two-Fold Asset', C: 'Two-Factor Access', correct: 'A' },
  { id: 'q44', category: 'Security & Wallets', question: 'What is "KYC"?', A: 'Know Your Customer', B: 'Keep Your Crypto', C: 'Key Yield Calculation', correct: 'A' },
  { id: 'q45', category: 'Security & Wallets', question: 'What is "AML"?', A: 'Anti-Money Laundering', B: 'Asset Market Level', C: 'Automated Money Link', correct: 'A' },
  { id: 'q46', category: 'DeFi & Trading', question: 'What is "Slippage"?', A: 'Falling on ice', B: 'Difference between expected and actual price', C: 'A slow network', correct: 'B' },
  { id: 'q47', category: 'DeFi & Trading', question: 'What is "Liquidity"?', A: 'A type of liquid', B: 'Ease of buying/selling an asset', C: 'A wet computer', correct: 'B' },
  { id: 'q48', category: 'DeFi & Trading', question: 'What is "Arbitrage"?', A: 'A legal dispute', B: 'Profiting from price differences on exchanges', C: 'A type of crypto mining', correct: 'B' },
  { id: 'q49', category: 'DeFi & Trading', question: 'What is "Bagholder"?', A: 'Someone carrying a bag', B: 'Someone holding a coin that lost value', C: 'A crypto wallet', correct: 'B' },
  { id: 'q50', category: 'Crypto Terminology', question: 'What is "DYOR"?', A: 'Do Your Own Research', B: 'Digital Yield Online Return', C: 'Direct Yield On Reward', correct: 'A' },
  { id: 'q51', category: 'Bitcoin Basics', question: 'What is a "Satoshi Nakamoto"?', A: 'A Japanese city', B: 'The creator of Bitcoin', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q52', category: 'Crypto Terminology', question: 'What is "FUD"?', A: 'Fear, Uncertainty, and Doubt', B: 'Fast Universal Data', C: 'Future Unit Distribution', correct: 'A' },
  { id: 'q53', category: 'Blockchain Technology', question: 'What is a "Genesis Block"?', A: 'The last block in a chain', B: 'The first block of a blockchain', C: 'A block containing only fees', correct: 'B' },
  { id: 'q54', category: 'Blockchain Technology', question: 'What is "Proof of Work"?', A: 'A resume', B: 'A consensus mechanism using computation', C: 'A way to prove you own coins', correct: 'B' },
  { id: 'q55', category: 'Blockchain Technology', question: 'What is "Proof of Stake"?', A: 'A consensus mechanism using coin ownership', B: 'A way to bet on sports', C: 'A physical certificate', correct: 'A' },
  { id: 'q56', category: 'Blockchain Technology', question: 'What is a "Fork" in blockchain?', A: 'A dining utensil', B: 'A split in the blockchain network', C: 'A way to eat crypto', correct: 'B' },
  { id: 'q57', category: 'Blockchain Technology', question: 'What is a "Hard Fork"?', A: 'A fork made of steel', B: 'A non-backward compatible upgrade', C: 'A very difficult transaction', correct: 'B' },
  { id: 'q58', category: 'Blockchain Technology', question: 'What is a "Soft Fork"?', A: 'A plastic fork', B: 'A backward compatible upgrade', C: 'A slow transaction', correct: 'B' },
  { id: 'q59', category: 'Blockchain Technology', question: 'What is "Mainnet"?', A: 'The primary network for transactions', B: 'A testing network', C: 'A social media for miners', correct: 'A' },
  { id: 'q60', category: 'Blockchain Technology', question: 'What is "Testnet"?', A: 'A network for testing code', B: 'The network where real money is', C: 'A net used by fishermen', correct: 'A' },
  { id: 'q61', category: 'DeFi & Trading', question: 'What is "Liquidity Pool"?', A: 'A swimming pool', B: 'A collection of funds for trading', C: 'A place to wash coins', correct: 'B' },
  { id: 'q62', category: 'DeFi & Trading', question: 'What is "Total Value Locked" (TVL)?', A: 'Total weight of coins', B: 'Total assets deposited in DeFi', C: 'Total number of locked wallets', correct: 'B' },
  { id: 'q63', category: 'DeFi & Trading', question: 'What is "Impermanent Loss"?', A: 'Losing your keys temporarily', B: 'Loss due to price changes in liquidity pools', C: 'A loss that doesn\'t matter', correct: 'B' },
  { id: 'q64', category: 'Blockchain Technology', question: 'What is "Governance Token"?', A: 'A token used for voting on projects', B: 'A token issued by government', C: 'A token that is illegal', correct: 'A' },
  { id: 'q65', category: 'Blockchain Technology', question: 'What is "Layer 2"?', A: 'A second floor', B: 'A scaling solution built on top of a blockchain', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q66', category: 'Blockchain Technology', question: 'What is "Sidechain"?', A: 'A chain on the side of a bike', B: 'A separate blockchain connected to a main one', C: 'A fake blockchain', correct: 'B' },
  { id: 'q67', category: 'Crypto Terminology', question: 'What is "Burning" tokens?', A: 'Setting physical coins on fire', B: 'Permanently removing tokens from circulation', C: 'Selling tokens at a loss', correct: 'B' },
  { id: 'q68', category: 'Crypto Terminology', question: 'What is "Market Cap"?', A: 'A hat for traders', B: 'Total value of all circulating coins', C: 'The price of one coin', correct: 'B' },
  { id: 'q69', category: 'Crypto Terminology', question: 'What is "Circulating Supply"?', A: 'Total coins ever made', B: 'Coins currently available to the public', C: 'Coins held by the creator', correct: 'B' },
  { id: 'q70', category: 'Crypto Terminology', question: 'What is "Max Supply"?', A: 'The most coins that will ever exist', B: 'The most coins you can buy', C: 'The highest price of a coin', correct: 'A' },
  { id: 'q71', category: 'Verse Ecosystem', question: 'What is "Verse"?', A: 'A type of poetry', B: 'Bitcoin.com\'s ecosystem token', C: 'A new social media platform', correct: 'B' },
  { id: 'q72', category: 'Blockchain Technology', question: 'What is a "DApp"?', A: 'Digital Application', B: 'Decentralized Application', C: 'Direct Application', correct: 'B' },
  { id: 'q73', category: 'Verse Ecosystem', question: 'Which network does Verse primarily reside on?', A: 'Bitcoin', B: 'Ethereum', C: 'Solana', correct: 'B' },
  { id: 'q74', category: 'Verse Ecosystem', question: 'What is the utility of the Verse token?', A: 'Only for decoration', B: 'Rewards, governance, and ecosystem utility', C: 'To pay for electricity', correct: 'B' },
  { id: 'q75', category: 'DeFi & Trading', question: 'What is "DCA"?', A: 'Digital Coin Asset', B: 'Dollar Cost Averaging', C: 'Direct Cash Access', correct: 'B' },
  { id: 'q76', category: 'DeFi & Trading', question: 'What is a "Limit Order"?', A: 'An order to buy/sell at a specific price or better', B: 'An order with a time limit', C: 'An order that is limited to 1 coin', correct: 'A' },
  { id: 'q77', category: 'DeFi & Trading', question: 'What is a "Market Order"?', A: 'An order to buy/sell immediately at the best available price', B: 'An order placed at a physical market', C: 'An order for groceries', correct: 'A' },
  { id: 'q78', category: 'DeFi & Trading', question: 'What is "Total Value Locked" (TVL) used to measure?', A: 'The weight of a blockchain', B: 'The total assets deposited in a DeFi protocol', C: 'The number of locked wallets', correct: 'B' },
  { id: 'q79', category: 'DeFi & Trading', question: 'What is "Impermanent Loss"?', A: 'Losing your keys temporarily', B: 'A temporary loss of funds when providing liquidity due to price volatility', C: 'A loss that doesn\'t matter', correct: 'B' },
  { id: 'q80', category: 'Blockchain Technology', question: 'What is a "Governance Token"?', A: 'A token that gives holders voting rights on project decisions', B: 'A token issued by a government', C: 'A token used to pay taxes', correct: 'A' },
  { id: 'q81', category: 'Blockchain Technology', question: 'What is "Layer 2"?', A: 'The second floor of a bank', B: 'A scaling solution built on top of a Layer 1 blockchain', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q82', category: 'Blockchain Technology', question: 'Which of these is a Layer 2 solution?', A: 'Bitcoin', B: 'Polygon', C: 'Ethereum', correct: 'B' },
  { id: 'q83', category: 'Ethereum & Smart Contracts', question: 'What is "Gas" on the Ethereum network?', A: 'Physical fuel', B: 'The unit that measures the computational effort for transactions', C: 'A type of crypto scam', correct: 'B' },
  { id: 'q84', category: 'Security & Wallets', question: 'What is a "Self-Custody" wallet?', A: 'A wallet where you control the private keys', B: 'A wallet managed by a bank', C: 'A wallet that locks itself', correct: 'A' },
  { id: 'q85', category: 'Security & Wallets', question: 'What is a "Seed Phrase" (Recovery Phrase)?', A: 'A list of words that can restore access to your wallet', B: 'A password for your email', C: 'A type of crypto gardening', correct: 'A' },
  { id: 'q86', category: 'Security & Wallets', question: 'What is "Phishing" in crypto?', A: 'Catching fish with crypto', B: 'A scam to trick you into giving away your private keys', C: 'A type of crypto mining', correct: 'B' },
  { id: 'q87', category: 'Security & Wallets', question: 'What is "2FA"?', A: 'Two-Factor Authentication', B: 'Two-Fold Asset', C: 'Two-Factor Access', correct: 'A' },
  { id: 'q88', category: 'Security & Wallets', question: 'What is a "Hardware Wallet"?', A: 'A wallet made of metal', B: 'A physical device that stores private keys offline', C: 'A wallet for your computer hardware', correct: 'B' },
  { id: 'q89', category: 'DeFi & Trading', question: 'What is "Slippage" in trading?', A: 'Falling on ice', B: 'The difference between the expected price and the executed price', C: 'A slow network', correct: 'B' },
  { id: 'q90', category: 'DeFi & Trading', question: 'What is "Liquidity Mining"?', A: 'Digging for liquid gold', B: 'Providing liquidity to a DEX to earn rewards', C: 'Selling coins at a loss', correct: 'B' },
  { id: 'q91', category: 'DeFi & Trading', question: 'What is "Staking" in a PoS network?', A: 'Eating a steak', B: 'Locking up tokens to secure the network and earn rewards', C: 'Selling all your tokens', correct: 'B' },
  { id: 'q92', category: 'Crypto Terminology', question: 'What is a "Stablecoin" pegged to the USD?', A: 'A coin that is always $1', B: 'A coin that is always $100', C: 'A coin that changes price every day', correct: 'A' },
  { id: 'q93', category: 'Crypto Terminology', question: 'What is "USDC"?', A: 'A popular stablecoin', B: 'A type of Bitcoin', C: 'A crypto exchange', correct: 'A' },
  { id: 'q94', category: 'Crypto Terminology', question: 'What is "Wrapped Bitcoin" (WBTC)?', A: 'Bitcoin in a gift box', B: 'An ERC-20 token backed 1:1 by Bitcoin', C: 'A fake Bitcoin', correct: 'B' },
  { id: 'q95', category: 'Blockchain Technology', question: 'What is a "Bridge" in crypto?', A: 'A physical bridge', B: 'A tool that allows you to move assets between different blockchains', C: 'A way to connect two computers', correct: 'B' },
  { id: 'q96', category: 'Blockchain Technology', question: 'What is "Mainnet"?', A: 'The primary blockchain where real transactions occur', B: 'A testing network', C: 'A social media for miners', correct: 'A' },
  { id: 'q97', category: 'Blockchain Technology', question: 'What is "Testnet"?', A: 'A network used by developers to test applications', B: 'The network where real money is', C: 'A net used by fishermen', correct: 'A' },
  { id: 'q98', category: 'Crypto Terminology', question: 'What is "Burning" in crypto?', A: 'Setting physical coins on fire', B: 'Permanently removing tokens from circulation to reduce supply', C: 'Selling tokens at a loss', correct: 'B' },
  { id: 'q99', category: 'Crypto Terminology', question: 'What is "Tokenomics"?', A: 'The study of tokens', B: 'The economic model and supply/demand characteristics of a token', C: 'A type of crypto game', correct: 'B' },
  { id: 'q100', category: 'Verse Ecosystem', question: 'What is "Bitcoin.com"?', A: 'A news site only', B: 'A comprehensive platform for Bitcoin and crypto services', C: 'A government website', correct: 'B' },
  { id: 'q101', category: 'DeFi & Trading', question: 'What is a "Limit Order"?', A: 'Buying at the current price', B: 'Buying at a specific set price', C: 'Buying with a credit card', correct: 'B' },
  { id: 'q102', category: 'DeFi & Trading', question: 'What is "Market Cap"?', A: 'Total coins multiplied by price', B: 'The price of one coin', C: 'The number of people holding a coin', correct: 'A' },
  { id: 'q103', category: 'DeFi & Trading', question: 'What is "Circulating Supply"?', A: 'Total coins ever made', B: 'Coins currently available in the market', C: 'Coins held by the founder', correct: 'B' },
  { id: 'q104', category: 'DeFi & Trading', question: 'What is "Total Supply"?', A: 'Coins currently in circulation', B: 'Total coins that exist minus burned coins', C: 'The maximum coins that will ever exist', correct: 'B' },
  { id: 'q105', category: 'DeFi & Trading', question: 'What is "Max Supply"?', A: 'The most coins that will ever exist', B: 'The most coins you can buy', C: 'The highest price reached', correct: 'A' },
  { id: 'q106', category: 'Crypto Terminology', question: 'What is a "Stablecoin"?', A: 'A coin that never moves', B: 'A coin pegged to a stable asset like USD', C: 'A coin used for betting', correct: 'B' },
  { id: 'q107', category: 'Crypto Terminology', question: 'What is "USDT" (Tether)?', A: 'A type of Bitcoin', B: 'A popular stablecoin', C: 'A crypto exchange', correct: 'B' },
  { id: 'q108', category: 'Crypto Terminology', question: 'What is "USDC"?', A: 'A stablecoin issued by Circle', B: 'A coin for US citizens only', C: 'A type of Ethereum', correct: 'A' },
  { id: 'q109', category: 'Crypto Terminology', question: 'What is "DAI"?', A: 'A centralized stablecoin', B: 'A decentralized stablecoin on Ethereum', C: 'A coin from China', correct: 'B' },
  { id: 'q110', category: 'Crypto Terminology', question: 'What is "Wrapped Bitcoin" (WBTC)?', A: 'Bitcoin in a gift box', B: 'An ERC-20 token representing Bitcoin on Ethereum', C: 'A fake Bitcoin', correct: 'B' },
  { id: 'q111', category: 'Blockchain Technology', question: 'What is a "Bridge"?', A: 'A way to connect two computers', B: 'A protocol to move assets between blockchains', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q112', category: 'Blockchain Technology', question: 'What is "Layer 2"?', A: 'A second floor', B: 'A scaling solution built on top of a Layer 1', C: 'A type of crypto security', correct: 'B' },
  { id: 'q113', category: 'Blockchain Technology', question: 'Which of these is a Layer 2?', A: 'Bitcoin', B: 'Arbitrum', C: 'Ethereum', correct: 'B' },
  { id: 'q114', category: 'Blockchain Technology', question: 'What is "Optimism"?', A: 'A positive attitude', B: 'A Layer 2 scaling solution for Ethereum', C: 'A type of crypto scam', correct: 'B' },
  { id: 'q115', category: 'Blockchain Technology', question: 'What is "Polygon" (MATIC)?', A: 'A geometric shape', B: 'A multi-chain scaling solution for Ethereum', C: 'A new blockchain for Bitcoin', correct: 'B' },
  { id: 'q116', category: 'Blockchain Technology', question: 'What is "Solana"?', A: 'A type of sun cream', B: 'A high-performance Layer 1 blockchain', C: 'A crypto wallet', correct: 'B' },
  { id: 'q117', category: 'Blockchain Technology', question: 'What is "Cardano"?', A: 'A type of car', B: 'A Proof-of-Stake blockchain platform', C: 'A crypto exchange', correct: 'B' },
  { id: 'q118', category: 'Blockchain Technology', question: 'What is "Polkadot"?', A: 'A pattern on clothes', B: 'A multi-chain interoperability protocol', C: 'A type of crypto scam', correct: 'B' },
  { id: 'q119', category: 'Blockchain Technology', question: 'What is "Chainlink"?', A: 'A chain for a bike', B: 'A decentralized oracle network', C: 'A type of crypto wallet', correct: 'B' },
  { id: 'q120', category: 'Blockchain Technology', question: 'What is an "Oracle" in crypto?', A: 'A fortune teller', B: 'A service that provides external data to smart contracts', C: 'A type of crypto miner', correct: 'B' },
];
