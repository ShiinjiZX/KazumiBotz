import util from "util";

const handler = async (m, { conn, text, command }) => {
    //if (!m.isAdmin || !m.isOwner) return m.reply("Anda Bukan Admin")
    if (!m.quoted) return m.reply("Balas Pesan Yang Mau Di Up Sw Group");
    await conn.relayMessage(
        m.chat,
        {
            groupStatusMessageV2: {
                message: m.quoted
            }
        },
        {}
    );
    m.reply("Done");
};

handler.command = ["swgc"];
handler.tags = ["group"];
handler.help = ["upswgroup"];

export default handler;