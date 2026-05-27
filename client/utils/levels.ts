import { LEVEL_COLORS } from '@/config/constants'

const levelColorIndex = (level?: number): number => {
    if (!level || level < 1) {
        return 0
    }
    return Math.min(Math.floor((level - 1) / 3), LEVEL_COLORS.length - 1)
}

export const levelColors = (level?: number): { fill: string; border: string } => LEVEL_COLORS[levelColorIndex(level)]

export const levelColor = (level?: number): string => levelColors(level).fill

export const nextLevelPercentage = (currentExperience: number, experienceToNextLevel: number): number => {
    if (currentExperience < 0 || experienceToNextLevel <= 0) {
        return 0
    }
    return Math.min(100, (currentExperience / experienceToNextLevel) * 100)
}
