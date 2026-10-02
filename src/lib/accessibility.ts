/**
 * 접근성 기능 이름과 주소 조각의 대응표.
 *
 * 기능 이름이 한글이라 그대로 주소에 넣으면 퍼센트 인코딩으로 길어진다.
 * Steam 이 주는 항목은 고정 목록이라 손으로 적어 둬도 흔들리지 않는다.
 *
 * 표에 없는 기능이 새로 생기면 목록에는 세우되 전용 주소는 만들지 않는다 —
 * 아무 규칙으로 주소를 지어내면 나중에 이름이 바뀔 때 링크가 통째로 깨진다.
 */
export const ACCESSIBILITY_SLUGS: Record<string, string> = {
  "난이도 조정": "difficulty",
  "자막 옵션": "subtitles",
  "색상 대체": "color",
  "텍스트 크기 조정": "text-size",
  "카메라 움직임 조정": "camera",
  "음량 개별 조절": "volume",
  "음성 채팅 텍스트 변환": "voice-to-text",
  "텍스트 채팅 음성 변환": "text-to-voice",
};

/** 주소 조각 하나가 가리키는 기능 이름. 없으면 undefined. */
export function featureForSlug(slug: string): string | undefined {
  return Object.entries(ACCESSIBILITY_SLUGS).find(([, value]) => value === slug)?.[0];
}

/** 화면에서 "그래서 뭘 할 수 있는데" 에 답하는 한 줄. */
export const ACCESSIBILITY_NOTES: Record<string, string> = {
  "난이도 조정": "전투나 진행 난이도를 따로 낮출 수 있는 게임입니다.",
  "자막 옵션": "자막 크기·배경·화자 표시 같은 것을 손댈 수 있습니다.",
  "색상 대체": "색각 이상을 위한 대체 색 구성을 제공합니다.",
  "텍스트 크기 조정": "글자 크기를 키울 수 있습니다.",
  "카메라 움직임 조정": "화면 흔들림이나 시야각을 줄여 멀미를 덜 수 있습니다.",
  "음량 개별 조절": "음악·효과음·대사 음량을 따로 조절할 수 있습니다.",
  "음성 채팅 텍스트 변환": "다른 사람의 음성 채팅을 글자로 보여 줍니다.",
  "텍스트 채팅 음성 변환": "입력한 글을 음성으로 읽어 줍니다.",
};
