export interface Imgix {
    aliases:            { [key: string]: string };
    categoryValues:     string[];
    colorKeywordValues: string[];
    fontValues:         string[];
    parameters:         Parameters;
    version:            string;
}

export interface Parameters {
    ar:                    Ar;
    auto:                  Auto;
    bg:                    Bg;
    blend:                 Bg;
    "blend-align":         Auto;
    "blend-alpha":         BlendAlpha;
    "blend-color":         Bg;
    "blend-crop":          Auto;
    "blend-fit":           Auto;
    "blend-h":             BlendAlpha;
    "blend-mode":          Auto;
    "blend-pad":           BlendPad;
    "blend-size":          Auto;
    "blend-w":             BlendAlpha;
    "blend-x":             BlendPad;
    "blend-y":             BlendPad;
    blur:                  Blur;
    border:                Border;
    "border-bottom":       Blur;
    "border-left":         Blur;
    "border-radius":       BorderRadius;
    "border-radius-inner": BorderRadius;
    "border-right":        Blur;
    "border-top":          Blur;
    bri:                   Blur;
    ch:                    Auto;
    chromasub:             Chromasub;
    colorquant:            Blur;
    colors:                Blur;
    con:                   Blur;
    "corner-radius":       BorderRadius;
    crop:                  Auto;
    cs:                    Auto;
    dl:                    Bg;
    dpi:                   DPI;
    dpr:                   Dpr;
    duotone:               Duotone;
    "duotone-alpha":       BlendAlpha;
    exp:                   Blur;
    expires:               Bg;
    faceindex:             BlendPad;
    facepad:               Blur;
    faces:                 Chromasub;
    fill:                  Auto;
    "fill-color":          Bg;
    fit:                   Auto;
    flip:                  Auto;
    fm:                    Auto;
    "fp-debug":            Bg;
    "fp-x":                FP;
    "fp-y":                FP;
    "fp-z":                Fpz;
    gam:                   Blur;
    "grid-colors":         GridColors;
    "grid-size":           GridSize;
    h:                     BlendAlpha;
    high:                  Blur;
    htn:                   Blur;
    hue:                   Blur;
    invert:                Bg;
    iptc:                  Auto;
    lossless:              Bg;
    mark:                  Bg;
    "mark-align":          Auto;
    "mark-alpha":          Blur;
    "mark-base":           Bg;
    "mark-fit":            Auto;
    "mark-h":              BlendAlpha;
    "mark-pad":            BlendPad;
    "mark-rot":            Blur;
    "mark-scale":          Blur;
    "mark-tile":           Auto;
    "mark-w":              BlendAlpha;
    "mark-x":              BlendPad;
    "mark-y":              Ar;
    mask:                  Mask;
    "mask-bg":             Bg;
    "max-h":               BlendAlpha;
    "max-w":               BlendAlpha;
    "min-h":               BlendAlpha;
    "min-w":               BlendAlpha;
    monochrome:            Bg;
    nr:                    Blur;
    nrs:                   Blur;
    orient:                Chromasub;
    pad:                   BlendPad;
    "pad-bottom":          PadBottom;
    "pad-left":            PadBottom;
    "pad-right":           PadBottom;
    "pad-top":             PadBottom;
    page:                  BlendPad;
    palette:               Auto;
    "pdf-annotation":      Bg;
    prefix:                Bg;
    px:                    Blur;
    q:                     Blur;
    rect:                  Rect;
    rot:                   Blur;
    sat:                   Blur;
    sepia:                 Blur;
    shad:                  Blur;
    sharp:                 Blur;
    transparency:          Auto;
    trim:                  Auto;
    "trim-color":          Bg;
    "trim-md":             BlendPad;
    "trim-pad":            BlendPad;
    "trim-sd":             BlendPad;
    "trim-tol":            BlendPad;
    txt:                   Bg;
    "txt-align":           Auto;
    "txt-clip":            Auto;
    "txt-color":           Bg;
    "txt-fit":             Auto;
    "txt-font":            Bg;
    "txt-lead":            BlendPad;
    "txt-lig":             Chromasub;
    "txt-line":            BlendPad;
    "txt-line-color":      Bg;
    "txt-pad":             PadBottom;
    "txt-shad":            Blur;
    "txt-size":            BlendPad;
    "txt-track":           BlendPad;
    "txt-width":           BlendPad;
    "txt-x":               Bg;
    "txt-y":               Bg;
    usm:                   Blur;
    usmrad:                BlendPad;
    vib:                   Blur;
    w:                     BlendAlpha;
}

export interface Ar {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           The2_Element[];
    short_description: string;
    url:               string;
}

export enum AvailableIn {
    Graph = "graph",
    Output = "output",
    URL = "url",
}

export interface The2_Element {
    strict_range: The2_StrictRange;
    type:         The1_Type;
}

export interface The2_StrictRange {
    min: number;
}

export enum The1_Type {
    Integer = "integer",
    Ratio = "ratio",
}

export interface Auto {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          string;
    depends?:          string[];
    disallow_base64?:  boolean;
    display_name:      string;
    expects:           AutoExpect[];
    short_description: string;
    url?:              string;
}

export interface AutoExpect {
    possible_values?: string[];
    type:             PurpleType;
}

export enum PurpleType {
    List = "list",
    Path = "path",
    String = "string",
    URL = "url",
}

export interface Bg {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          boolean | number | string;
    depends?:          string[];
    display_name:      string;
    expects:           BgExpect[];
    short_description: string;
    url:               string;
}

export interface BgExpect {
    type: string;
}

export interface BlendAlpha {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          number;
    depends?:          string[];
    display_name:      string;
    expects:           BlendAlphaExpect[];
    short_description: string;
    url:               string;
}

export interface BlendAlphaExpect {
    strict_range: PurpleRange;
    type:         FluffyType;
}

export interface PurpleRange {
    max?: number;
    min:  number;
}

export enum FluffyType {
    Integer = "integer",
    UnitScalar = "unit_scalar",
}

export interface BlendPad {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          number;
    depends?:          string[];
    display_name:      string;
    expects:           BlendPadExpect[];
    short_description: string;
    url:               string;
}

export interface BlendPadExpect {
    suggested_range: The2_StrictRange;
    type:            TentacledType;
}

export enum TentacledType {
    Integer = "integer",
    Number = "number",
}

export interface Blur {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          number;
    depends?:          string[];
    display_name:      string;
    expects:           BlurExpect[];
    short_description: string;
    url:               string;
}

export interface BlurExpect {
    suggested_range: PurpleRange;
    type:            TentacledType;
}

export interface Border {
    available_in:      AvailableIn[];
    category:          string;
    display_name:      string;
    expects:           BorderExpect[];
    short_description: string;
    url:               string;
}

export interface BorderExpect {
    "0":    BlurExpect[];
    "1":    BgExpect[];
    length: number;
    type:   PurpleType;
}

export interface BorderRadius {
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           BorderRadiusExpect[];
    short_description: string;
    url:               string;
}

export interface BorderRadiusExpect {
    "0"?:          The2_Element[];
    "1"?:          The2_Element[];
    "2"?:          The2_Element[];
    "3"?:          The2_Element[];
    length?:       number;
    strict_range?: The2_StrictRange;
    type:          string;
}

export interface Chromasub {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    default?:          number;
    depends?:          string[];
    display_name:      string;
    expects:           ChromasubExpect[];
    short_description: string;
    url:               string;
}

export interface ChromasubExpect {
    possible_values: number[];
    type:            The1_Type;
}

export interface DPI {
    available_in:      AvailableIn[];
    category:          string;
    display_name:      string;
    expects:           BlendPadExpect[];
    short_description: string;
    url:               string;
}

export interface Dpr {
    available_in:      AvailableIn[];
    category:          string;
    default:           number;
    display_name:      string;
    expects:           DprExpect[];
    short_description: string;
    url:               string;
}

export interface DprExpect {
    default?:        number;
    strict_range:    PurpleRange;
    suggested_range: PurpleRange;
    type:            TentacledType;
}

export interface Duotone {
    available_in:      AvailableIn[];
    category:          string;
    display_name:      string;
    expects:           DuotoneExpect[];
    short_description: string;
    url:               string;
}

export interface DuotoneExpect {
    "0":      BgExpect[];
    "1":      BgExpect[];
    default?: string;
    length:   number;
    type:     PurpleType;
}

export interface FP {
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           FPXExpect[];
    short_description: string;
    url:               string;
}

export interface FPXExpect {
    default:      number;
    strict_range: PurpleRange;
    type:         FluffyType;
}

export interface Fpz {
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           DprExpect[];
    short_description: string;
    url:               string;
}

export interface GridColors {
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           DuotoneExpect[];
    short_description: string;
}

export interface GridSize {
    available_in:      AvailableIn[];
    category:          string;
    depends:           string[];
    display_name:      string;
    expects:           GridSizeExpect[];
    short_description: string;
}

export interface GridSizeExpect {
    default:      number;
    strict_range: The2_StrictRange;
    type:         The1_Type;
}

export interface Mask {
    available_in:      AvailableIn[];
    category:          string;
    display_name:      string;
    expects:           AutoExpect[];
    short_description: string;
    url:               string;
}

export interface PadBottom {
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    depends?:          string[];
    display_name:      string;
    expects:           PadBottomExpect[];
    short_description: string;
    url:               string;
}

export interface PadBottomExpect {
    default:         number;
    suggested_range: The2_StrictRange;
    type:            The1_Type;
}

export interface Rect {
    available_in:      AvailableIn[];
    category:          string;
    display_name:      string;
    expects:           RectExpect[];
    short_description: string;
    url:               string;
}

export interface RectExpect {
    "0":    The0[];
    "1":    The0[];
    "2":    The2_Element[];
    "3":    The2_Element[];
    length: number;
    type:   PurpleType;
}

export interface The0 {
    possible_values?: string[];
    strict_range?:    PurpleRange;
    type:             string;
}
