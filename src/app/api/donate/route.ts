import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    createPostResponse,
} from "@solana/actions";
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
} from "@solana/web3.js";

// GET request handler
export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload: ActionGetResponse = {
        icon: "/images/icon.png", // Local icon path
        title: "Donate to Dharmin",
        description: "Support Dharmin by donating SOL.",
        label: "Donate",
        links: {
            actions: [
                {
                    type: "transaction",
                    label: "Donate 0.1 SOL",
                    href: `${url.href}?amount=0.1`,
                },
            ],
        },
    };
    return new Response(JSON.stringify(payload), {
        headers: ACTIONS_CORS_HEADERS,
    });
}

export const OPTIONS = GET; // OPTIONS request handler

// POST request handler
export async function POST(request: Request) {
    const body: ActionPostRequest = await request.json();
    const url = new URL(request.url);
    const amount = Number(url.searchParams.get("amount")) || 0.1;
    let sender;

    try {
        sender = new PublicKey(body.account);
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: {
                    message: "Invalid account",
                },
            }),
            {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            }
        );
    }

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: sender, // Sender public key
            toPubkey: new PublicKey("DAhS7No6mzrxViz8CVUjMRVq7HjESMwEdbHa2gjPXogH"), // Replace with your recipient public key
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );
    transaction.feePayer = sender;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;

    const payload: ActionPostResponse = await createPostResponse({
        fields: {
            type: "transaction",
            transaction: transaction,
            message: "Transaction created",
        },
    });
    return new Response(JSON.stringify(payload), {
        headers: ACTIONS_CORS_HEADERS,
    });
}
