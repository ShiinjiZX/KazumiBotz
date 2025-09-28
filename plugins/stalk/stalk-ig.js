import axios from "axios";
import cheerio from "cheerio";

// Fungsi scrape
async function igstalk(user) {
  try {
    const response = await axios.post(
      "https://privatephotoviewer.com/wp-json/instagram-viewer/v1/fetch-profile",
      {
        find: user,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const $ = cheerio.load(response.data.html);

    let profilePicture = $("#profile-insta img").attr("src");
    const nickname = $(".col-md-8 h4").text().trim();
    const username = $(".col-md-8 h5").text().trim();
    const posts = $(".col-md-8 .text-center").eq(0).find("strong").text().trim();
    const followers = $(".col-md-8 .text-center").eq(1).find("strong").text().trim();
    const following = $(".col-md-8 .text-center").eq(2).find("strong").text().trim();
    const bio = $(".col-md-8 p").html().replace(/<br\s*\/?>/g, "\n").trim();

    return {
      status: true,
      creator: "JER OFC",
      data: {
        nickname,
        username,
        bio,
        posts,
        followers,
        following,
        profile: "https://www.instagram.com/" + username.replace("@", ""),
        profileUrl: profilePicture,
      },
    };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Handler command
let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("Masukkan username Instagram yang ingin di-stalk!");
  try {
    let result = await igstalk(text);

    let message = `
*Instagram Stalker*
- *Nickname:* ${result.data.nickname}
- *Username:* ${result.data.username}
- *Bio:* ${result.data.bio}
- *Posts:* ${result.data.posts}
- *Followers:* ${result.data.followers}
- *Following:* ${result.data.following}
- *Profile:* ${result.data.profile}
    `;

    // Mengirimkan gambar profile picture dengan pesan
    await conn.sendMessage(m.chat, { image: { url: result.data.profileUrl }, caption: message }, { quoted: m });
  } catch (e) {
    m.reply("Terjadi kesalahan atau username tidak ditemukan!");
  }
};

// Metadata command
handler.help = ['igstalk'].map(v => v + ' <username>');
handler.tags = ['stalk']
handler.command = ["stalkig","igstalk"]
handler.limit = false;

export default handler;