const { useMainPlayer, useQueue } = require("discord-player");
const { Translate } = require("../process_tools");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("syncedlyrics")
    .setDescription("Syncronize the lyrics with the song"),
  async execute({ interaction }) {
    const player = useMainPlayer();
    const queue = useQueue(interaction.guild);
    if (!queue?.isPlaying())
      return interaction.editReply({
        content: await Translate(
          `No music currently playing <${interaction.member}>... try again ? <❌>`
        ),
      });

    const metadataThread = queue.metadata.lyricsThread;
    if (metadataThread && !metadataThread.archived)
      return interaction.editReply({
        content: await Translate(
          `Lyrics thread already created <${interaction.member}> ! <${queue.metadata.lyricsThread}>`
        ),
      });

    const results = await player.lyrics
      .search({
        q: queue.currentTrack.title,
      })
      .catch(async (e) => {
        console.log(e);
        return interaction.editReply({
          content: await Translate(`Error! Please contact Developers! | <❌>`),
        });
      });

    const lyrics = results?.[0];
    if (!lyrics?.plainLyrics)
      return interaction.editReply({
        content: await Translate(
          `No lyrics found for <${queue.currentTrack.title}>... try again ? <❌>`
        ),
      });

    const thread = await queue.metadata.channel.threads.create({
      name: `Lyrics of ${queue.currentTrack.title}`,
    });

    queue.setMetadata({
      channel: queue.metadata.channel,
      lyricsThread: thread,
    });

    const syncedLyrics = queue?.syncedLyrics(lyrics);
    syncedLyrics.onChange(async (lyrics) => {
      await thread.send({
        content: lyrics,
      });
    });

    syncedLyrics?.subscribe();

    return interaction.editReply({
      content: await Translate(
        `Successfully syncronized lyrics in <${thread}> ! <${interaction.member}> <✅>`
      ),
    });
  },
};
