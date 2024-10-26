const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("controller")
    .setDescription("Send music controller to a channel")
    .setDefaultMemberPermissions(PermissionsBitField.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The text channel you want to send it to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute({ interaction }) {
    const channel = interaction.options.getChannel("channel");
    if (channel.type !== ChannelType.GuildText)
      return interaction.editReply({
        content: await Translate(
          `You need to send it to a text channel.. <❌>`
        ),
      });

    const embed = new EmbedBuilder()
      .setTitle(await Translate("Control your music with the buttons below !"))
      .setImage(interaction.guild.iconURL({ size: 4096, dynamic: true }))
      .setColor("#2f3136")
      .setFooter({
        text: await Translate(
          "Music comes first - Made with heart by the Community <❤️>"
        ),
        iconURL: interaction.member.avatarURL({ dynamic: true }),
      });

    interaction.editReply({
      content: await Translate(`Sending controller to <${channel}>... <✅>`),
    });

    const emojis = config.emojis;

    const EmojiState = config.emojis ? config.app.enableEmojis : false;

    const back = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.back : "Back")
      .setCustomId("back")
      .setStyle("Primary");

    const skip = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.skip : "Skip")
      .setCustomId("skip")
      .setStyle("Primary");

    const resumepause = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.ResumePause : "Resume & Pause")
      .setCustomId("resume&pause")
      .setStyle("Danger");

    const save = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.savetrack : "Save")
      .setCustomId("savetrack")
      .setStyle("Success");

    const volumeup = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.volumeUp : "Volume Up")
      .setCustomId("volumeup")
      .setStyle("Primary");

    const volumedown = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.volumeDown : "Volume Down")
      .setCustomId("volumedown")
      .setStyle("Primary");

    const loop = new ButtonBuilder()
      .setLabel(EmojiState ? emojis.loop : "Loop")
      .setCustomId("loop")
      .setStyle("Danger");

    const np = new ButtonBuilder()
      .setLabel("Now Playing")
      .setCustomId("nowplaying")
      .setStyle("Secondary");

    const queuebutton = new ButtonBuilder()
      .setLabel("Queue")
      .setCustomId("queue")
      .setStyle("Secondary");

    const lyrics = new ButtonBuilder()
      .setLabel("lyrics")
      .setCustomId("Lyrics")
      .setStyle("Primary");

    const shuffle = new ButtonBuilder()
      .setLabel("Shuffle")
      .setCustomId("shuffle")
      .setStyle("Success");

    const stop = new ButtonBuilder()
      .setLabel("Stop")
      .setCustomId("stop")
      .setStyle("Danger");

    const row1 = new ActionRowBuilder().addComponents(
      back,
      resumepause,
      skip,
      stop,
      save
    );
    const row2 = new ActionRowBuilder().addComponents(
      volumedown,
      volumeup,
      loop
    );
    const row3 = new ActionRowBuilder().addComponents(
      lyrics,
      shuffle,
      queuebutton,
      np
    );

    channel.send({ embeds: [embed], components: [row1, row2, row3] });
  },
};
