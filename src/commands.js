import { SlashCommandBuilder } from "discord.js";

export const commandDefinitions = [
  new SlashCommandBuilder()
    .setName("license-create-days")
    .setDescription("Tworzy licencje na okres w dniach.")
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
      option.setName("note").setDescription("Notatka do licencji.").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("license-info")
    .setDescription("Pokazuje szczegoly licencji.")
    .addStringOption(option =>
      option.setName("key").setDescription("Pelny klucz licencji.").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("license-revoke")
    .setDescription("Uniewaznia licencje.")
    .addStringOption(option =>
      option.setName("key").setDescription("Pelny klucz licencji.").setRequired(true)
    )
].map(command => command.toJSON());

