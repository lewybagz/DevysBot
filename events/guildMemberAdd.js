const cacheManager = require("../utils/cacheManager.js");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas } = require("@napi-rs/canvas");
const config = require("../config.js"); // If using config.js
const XPSystem = require("../utils/xpSystem");

const verificationMap = new Map();
const captchaSentMap = new Map();

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
  const xpSystem = new XPSystem(client);
  client.on("guildMemberAdd", async (member) => {
    console.log(`New member joined: ${member.user.tag}`);

    if (captchaSentMap.has(member.id)) {
      console.log(`Captcha already sent to ${member.user.tag}, skipping.`);
      return;
    }

    cacheManager.cacheMember(member);

    captchaSentMap.set(member.id, true);

    try {
      console.log("Config values:", config);
      // Assign noPermissionsRoleID role
      const noPermRole = member.guild.roles.cache.get(
        config.noPermissionsRoleID
      );
      if (noPermRole) {
        await member.roles.add(noPermRole);
        console.log(`Assigned no permissions role to ${member.user.tag}`);
      } else {
        console.error(
          `No permissions role not found: ${config.noPermissionsRoleID}`
        );
      }

      const { captchaBuffer, captchaText } = generateCaptcha();
      console.log(`Generated captcha for ${member.user.tag}: ${captchaText}`);
      verificationMap.set(member.id, captchaText);

      const attachment = new AttachmentBuilder(captchaBuffer, {
        name: "captcha.png",
      });

      const captchaMessage = new EmbedBuilder()
        .setTitle("Verification Required")
        .setDescription(
          "Please solve the captcha below by typing the characters you see. You have 5 minutes to complete the verification."
        )
        .setColor("#0000FF")
        .setImage("attachment://captcha.png");

      const dmChannel = await member.createDM();
      await dmChannel.send({ embeds: [captchaMessage], files: [attachment] });
      console.log(`Sent captcha to ${member.user.tag}`);

      // Wait for user response
      const filter = (response) => response.author.id === member.id;
      console.log(`Waiting for response from ${member.user.tag}`);
      const collected = await dmChannel.awaitMessages({
        filter,
        max: 1,
        time: 300000,
        errors: ["time"],
      }); // 5 minutes

      console.log(`Collected messages for ${member.user.tag}:`, collected.size);

      if (collected.size === 0) {
        console.log(`No response received from ${member.user.tag}`);
        throw new Error("User did not respond in time");
      }

      const answer = collected.first().content;
      console.log(`User ${member.user.tag} answered: ${answer}`);

      // Check if the answer is correct
      if (answer.toLowerCase() === captchaText.toLowerCase()) {
        console.log(`Captcha verified successfully for ${member.user.tag}`);
        await dmChannel.send(
          "Captcha verified successfully! Welcome to the server."
        );
        await xpSystem.initializeNewMember(member);
        verificationMap.delete(member.id);

        const verifiedRole = member.guild.roles.cache.get(
          config.verifiedRoleId
        );
        if (verifiedRole) {
          await member.roles.add(verifiedRole);
          if (noPermRole) await member.roles.remove(noPermRole);
          console.log(`Assigned verified role to ${member.user.tag}`);
        } else {
          console.error(`Verified role not found: ${config.verifiedRoleId}`);
        }
      } else {
        console.log(`Captcha verification failed for ${member.user.tag}`);
        await dmChannel.send("Captcha verification failed. Please try again.");
        await member.kick("Failed captcha verification.");
      }
    } catch (err) {
      console.error(`Failed to verify captcha for ${member.user.tag}:`, err);
      if (verificationMap.has(member.id)) {
        verificationMap.delete(member.id);
        await member.kick("Failed to complete captcha in time.");
      }
    } finally {
      // Remove the user from the captchaSentMap after a delay
      // This allows for potential retries if there was an error
      setTimeout(() => {
        captchaSentMap.delete(member.id);
      }, 60000); // 1 minute delay
    }
  });
};
