# ShotBrief specification

The input contract for the generation plane.

```ts
type Aspect = "9:16" | "1:1" | "16:9";
type GeneratorName = "higgsfield" | "meshy" | "manual";
type Beat = "hook" | "evidence" | "mechanism" | "value" | "payoff" | "cta";

interface ShotBrief {
  briefId: string;          // assigned server side by POST /brief
  shotIndex: number;        // 0-based, defines cut order
  beat: Beat;
  prompt: string;           // subject + camera move + lighting
  aspect: Aspect;
  durationSeconds: number;
  generator: GeneratorName;
  motionPreset?: string;    // provider preset id
  referenceImageUrl?: string; // presence switches t2v to i2v
}
```

## Validation rules

| Rule | Reason |
|---|---|
| `durationSeconds >= 2` for generated shots | Sub-two-second generations score badly on motion coherence |
| `prompt` names a concrete subject | Abstract prompts fail the `on_brief` sub-score |
| `prompt` states a camera move | Otherwise the model picks one and cuts fight each other |
| `shotIndex` contiguous from 0 | Timeline assembly assumes no gaps |
| Sum of estimated credits under the ceiling | Checked again server side before each submit |

## Example

```json
{
  "title": "Gate before render",
  "shots": [
    {
      "shotIndex": 0,
      "beat": "hook",
      "prompt": "macro push-in on a mechanical keyboard in near darkness, one lime backlit key, shallow depth of field, slow dolly forward",
      "aspect": "9:16",
      "durationSeconds": 2.0,
      "generator": "higgsfield"
    },
    {
      "shotIndex": 1,
      "beat": "mechanism",
      "prompt": "isometric rendering of a three-layer pipeline diagram, matte dark surfaces, lime edge lighting, slow orbit",
      "aspect": "9:16",
      "durationSeconds": 5.0,
      "generator": "meshy"
    }
  ]
}
```
