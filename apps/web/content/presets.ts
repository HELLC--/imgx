export interface Preset {
  i18nKey: string;
  params: string;
}

export const PRESETS: Preset[] = [
  { i18nKey: 'resizeWidth',     params: 'resize,w_300' },
  { i18nKey: 'circleAvatar',    params: 'resize,w_200,h_200,m_fill/circle,r_100' },
  { i18nKey: 'roundedCorners',  params: 'resize,w_400/rounded-corners,r_30' },
  { i18nKey: 'webpCompress',    params: 'format,webp/quality,q_75' },
  { i18nKey: 'rotateFlip',      params: 'rotate,90/flip,1' },
  { i18nKey: 'blur',            params: 'blur,r_8,s_5' },
  { i18nKey: 'squareCrop',      params: 'resize,w_500,h_500,m_fill' },
  { i18nKey: 'watermarkText',   params: 'watermark,text_SGVsbG8sd_t_50,g_se' },
];
