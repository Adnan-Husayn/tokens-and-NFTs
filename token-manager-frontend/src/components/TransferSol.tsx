'use client'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { get } from 'http';
import { FC, useEffect, useState } from 'react'

interface TransferSolProps {

}

const TransferSol: FC<TransferSolProps> = ({ }) => {
    const [balance, setBalance] = useState<number>(0);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const getBalance = async () => {
        if (!connection || !publicKey) {
            console.error("Wallet not connected or connection unavailable");
            return;
        }
        const val = await connection.getTokenAccountBalance(publicKey, 'confirmed')
        setBalance(Number(val));
        console.log(val);
        
    }
    useEffect(() => {
        getBalance()


    }, [connection, publicKey])


    return <div>
        {balance}
    </div>
}

export default TransferSol