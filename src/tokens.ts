import { isBeta, isDev } from './dev';

export const discordInteractionsPublicKey = isDev
    ? '1c8373cc360f44f27852db623309fddb365b04a6cabd71e7147d58d2e518772c'
    : isBeta
      ? 'be95afda2289e8ee7a27e1532292bd688b07bef3ff561e13e37da385ef218bac'
      : '3c099ea895329c84910e04260401078a6c659c4f69724e048b8cce3fdd7469e3'; // prod

export const discordInteractionsApplicationId = isDev
    ? '1285146763455365194'
    : isBeta
      ? '1300433591552966748'
      : '1285148080189997107'; // prod

export const discordInteractionsToken = isDev
    ? 'MTI4NTE0Njc2MzQ1NTM2NTE5NA.Gs9R9w.-dXTS8YXPAY-o-33PoKuuUuAy5SiT0RtYDF7uw'
    : isBeta
      ? 'MTMwMDQzMzU5MTU1Mjk2Njc0OA.GxUSth.5MOhrpWu0swoTV-G6V1ijY_d1aW3YLe4msB1Pk'
      : 'MTI4NTE0ODA4MDE4OTk5NzEwNw.GRRp8v.My3_48n6vIWOKZwQOOjPzZ1RaxTbvpyu6PiG5E'; // prod

export const robloxAuthClientId = '2567423461004624377';
export const robloxAuthSecret = 'RBX-KkLtWcojrUu8-RE95CFx4MenWvsMH6ty2Pvv7COmX4slZTNQ0Mb8tIVinmrXuE2_';

export const theCatApiToken = 'live_2nTZ9TxN25x26zvxK3MGh00CALdsOJ4GNX552EQ3mqa6YCKM29nGRTBrA0ks45Ao';

export const cloudflareCaptchaSecret = '0x4AAAAAAAyKao-un3emb-iIMmzw7JuTWlo';
