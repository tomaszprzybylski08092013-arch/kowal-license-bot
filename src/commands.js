import { SlashCommandBuilder } from "discord.js";

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName("license-create-days")
    .setDescription("Tworzy licencje na okres w dniach.")
    .addStringOption(option =>
      option.setName("nick").setDescription("Nick gracza z Minecrafta.").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("days").setDescription("Liczba dni, np. 1 albo 30.").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("note").setDescription("Notatka do licencji.").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("license-create-lifetime")
    .setDescription("Tworzy licencje lifetime.")
    .addStringOption(option =>
      option.setName("nick").setDescription("Nick gracza z Minecrafta.").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("note").setDescription("Notatka do licencji.").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("license-info")
    .setDescription("Pokazuje szczegoly licencji.")
    .addStringOption(option =>
      option.setName("key").setDescription("Pelny klucz licencji.").setRequired(false)
    )
    .addStringOption(option =>
      option.setName("nick").setDescription("Nick gracza z Minecrafta.").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("license-revoke")
    .setDescription("Uniewaznia licencje.")
    .addStringOption(option =>
      option.setName("key").setDescription("Pelny klucz licencji.").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("all-license")
    .setDescription("Pokazuje wszystkie licencje, 5 na strone.")
    .addIntegerOption(option =>
      option.setName("page").setDescription("Numer strony.").setRequired(false).setMinValue(1)
    ),
  new SlashCommandBuilder()
    .setName("all-license-active")
    .setDescription("Pokazuje aktywne licencje, 5 na strone.")
    .addIntegerOption(option =>
      option.setName("page").setDescription("Numer strony.").setRequired(false).setMinValue(1)
    )
].map(command => command.toJSON());
