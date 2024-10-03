const cacheManager = require("../utils/cacheManager.js");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const { createCanvas } = require("@napi-rs/canvas");
const config = require("../config.js"); // If using config.js

const verificationMap = new Map();

function generateCaptcha() {
  const canvas = createCanvas(200, 100);
  const ctx = canvas.getContext("2d");

  // Fill background with a random color
  ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
    Math.random() * 255
  )}, ${Math.floor(Math.random() * 255)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set font and color for the captcha text
  ctx.font = "bold 40px Sans";
  ctx.fillStyle = "#ffffff";
  const captchaText = Math.random().toString(36).substring(2, 7); // Generate a random 5-character captcha

  // Draw the captcha text on the canvas
  ctx.fillText(captchaText, 50, 60);

  // Optionally add some noise (lines or dots)
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 200, Math.random() * 100);
    ctx.lineTo(Math.random() * 200, Math.random() * 100);
    ctx.stroke();
  }

  // Convert the canvas to a Buffer
  const captchaBuffer = canvas.toBuffer("image/png");

  return { captchaBuffer, captchaText };
}

module.exports = async (client) => {
  client.on("guildMemberAdd", async (member) => {
    cacheManager.cacheMember(member);
    try {
      // Generate a captcha
      const { captchaBuffer, captchaText } = generateCaptcha();

      // Store the captcha text to verify later
      verificationMap.set(member.id, captchaText);

      const attachment = new MessageAttachment(captchaBuffer, "captcha.png");

      // Send the captcha to the user in a DM
      const captchaMessage = new MessageEmbed()
        .setTitle("Verification Required")
        .setDescription(
          "Please solve the captcha below by typing the characters you see. You have 5 minutes to complete the verification."
        )
        .setColor("BLUE")
        .setImage("attachment://captcha.png");

      const dmChannel = await member.createDM();
      await dmChannel.send({ embeds: [captchaMessage], files: [attachment] });

      // Wait for user response
      const filter = (response) => response.author.id === member.id;
      const collected = await dmChannel.awaitMessages({
        filter,
        max: 1,
        time: 300000,
        errors: ["time"],
      }); // 5 minutes

      const answer = collected.first().content;

      // Check if the answer is correct
      if (answer === captchaText) {
        await dmChannel.send(
          "Captcha verified successfully! Welcome to the server."
        );
        verificationMap.delete(member.id);
        // Add the verified role or remove restricted role here
        const verifiedRole = member.guild.roles.cache.find(
          (role) => role.name === config.verifiedRoleId
        );
        if (verifiedRole) {
          await member.roles.add(verifiedRole);
        }
      } else {
        await dmChannel.send("Captcha verification failed. Please try again.");
        // Optionally, kick the user or limit their access
        await member.kick("Failed captcha verification.");
      }
    } catch (err) {
      console.error(`Failed to verify captcha for ${member.user.tag}:`, err);
      // If the user doesn't complete the captcha in time, handle it here
      if (verificationMap.has(member.id)) {
        verificationMap.delete(member.id);
        await member.kick("Failed to complete captcha in time.");
      }
    }
  });
};
