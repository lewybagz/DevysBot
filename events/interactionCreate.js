const { EmbedBuilder, InteractionType } = require("discord.js");
const { useQueue } = require("discord-player");
const { Translate } = require("../process_tools");
const config = require("../config");

module.exports = async (client, interaction) => {
  if (!interaction) return;

  if (interaction.type === InteractionType.ApplicationCommand) {
    await interaction.deferReply({ ephemeral: true });
    const DJ = config.opt.DJ;
    const command = client.commands.get(interaction.commandName);

    const errorEmbed = new EmbedBuilder().setColor("#ff0000");

    if (!command) {
      errorEmbed.setDescription(
        await Translate("<❌> | Error! Please contact Developers!")
      );
      interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
      return client.slash.delete(interaction.commandName);
    }

    if (
      command.permissions &&
      !interaction.member.permissions.has(command.permissions)
    ) {
      errorEmbed.setDescription(
        await Translate(
          `<❌> | You need do not have the proper permissions to exacute this command`
        )
      );
      return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (
      DJ.enabled &&
      DJ.commands.includes(command) &&
      !interaction.member._roles.includes(
        interaction.guild.roles.cache.find((x) => x.name === DJ.roleName).id
      )
    ) {
      errorEmbed.setDescription(
        await Translate(
          `<❌> | This command is reserved For members with <\`${DJ.roleName}\`> `
        )
      );
      return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (command.voiceChannel) {
      if (!interaction.member.voice.channel) {
        errorEmbed.setDescription(
          await Translate(`<❌> | You are not in a Voice Channel`)
        );
        return interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      if (
        interaction.guild.members.me.voice.channel &&
        interaction.member.voice.channel.id !==
          interaction.guild.members.me.voice.channel.id
      ) {
        errorEmbed.setDescription(
          await Translate(`<❌> | You are not in the same Voice Channel`)
        );
        return interaction.editReply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    }

    command.execute({ interaction, client });
  } else if (interaction.type === InteractionType.MessageComponent) {
    await interaction.deferReply({ ephemeral: true });
    const customId = interaction.customId;
    if (!customId) return;

    const queue = useQueue(interaction.guild);
    const path = `../buttons/${customId}.js`;

    delete require.cache[require.resolve(path)];
    const button = require(path);
    if (button) return button({ client, interaction, customId, queue });
  }
};
