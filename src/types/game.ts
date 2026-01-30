export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vector2 {
    x: number;
    y: number;
}

export type SceneKey =
    | 'BootScene'
    | 'MenuScene'
    | 'GameScene'
    | 'EndingScene';

export type MapKey =
    | 'apartment'
    | 'theater'
    | 'fatherHouse'
    | 'naplesAlley'
    | 'bar';

export interface SaveData {
    highScore: number;
    timestamp: number;
}
