import {Button} from '@/types/blocks/base';

export interface TextToImageStyleOption {
    /** 提示词编码 */
    promptCode: string;
    /** 样式名称 */
    name: string;
    /** 样式描述 */
    description: string;
    /** 示例图片 URL，用于列表展示 */
    demoImageUrl: string;
}

export interface TextToImage {
    meta?: {
        title?: string;
        description?: string;
    };
    disabled?: boolean;
    name?: string;
    title?: string;
    description?: string;
    promptSection?: {
        title?: string;
        description?: string;
        promptPlaceholder?: {
            title?: string;
            description?: string;
            buttonText?: string;
        };
        textareaPlaceholder?: string;
        models?: [
            {
                name: string;
                code: string;
                tips: string;
                eventCode?: string;
                aspectRatios?: string[];
                credits?: number;
            }
        ]
    };
    resultSection?: {
        title?: string;
        emptyMessage?: {
            title?: string;
            description?: string;
        };
        processingMessage?: {
            title?: string;
            description?: string;
        };
        readyMessage?: {
            title?: string;
            description?: string;
        };
        downloadButton?: Button;
        tryAnotherButton?: Button;
    };
    styleSelection?: {
        title?: string;
        description?: string;
        inputFirstMessage?: string;
        selectedBadgeText?: string;
    };
    processingDuration?: number;
    progressTexts?: {
        processing?: string;
        complete?: string;
    };
    what?: Section;
    feature?: Section;
    why?: Section;
    faq?: Section;
}