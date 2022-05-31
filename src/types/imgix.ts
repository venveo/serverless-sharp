export interface Imgix {
    readonly aliases:            { [key: string]: string };
    readonly categoryValues:     string[];
    readonly colorKeywordValues: string[];
    readonly fontValues:         string[];
    readonly parameters:         Parameters;
    readonly version:            string;
}

export interface ParameterType {
    default?:          boolean | number | string;
    aliases?:          string[];
    available_in:      AvailableIn[];
    category:          string;
    depends?:          string[];
    display_name:      string;
    expects:           ExpectedValueDefinition[];
    short_description: string;
    url?:               string;
}

export enum CropMode {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
  FACES = "faces",
  ENTROPY = "entropy",
  EDGES = "edges",
  FOCALPOINT = "focalpoint"
}

export enum AutoMode {
  ENHANCE = "enhance",
  FORMAT = "format",
  REDEYE = "redeye",
  COMPRESS = "compress",
  TRUE = "true"
}

export enum FillMode {
  BLUR = "blur",
  SOLID = "solid"
}

export enum ResizeFitMode {
  CLAMP = "clamp",
  CLIP = "clip",
  CROP = "crop",
  FACEAREA = "facearea",
  FILL = "fill",
  FILLMAX = "fillmax",
  MAX = "max",
  MIN = "min",
  SCALE = "scale"
}

export interface ExpectedValueDefinition {
    default?: string|number;
    possible_values?: Array<string|number>;
    strict_range?: Range;
    suggested_range?: Range;
    type:         ExpectedValueType;
}

export interface Parameters {
    [index: string]:       ParameterType;
    ar:                    Ar;
    auto:                  Auto;
    bg:                    Bg;
    blend:                 Bg;
    "blend-align":         Auto;
    "blend-alpha":         BlendAlpha;
    "blend-color":         Bg;
    "blend-crop":          Auto;
    "blend-fit":            Auto;
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
    "mark-fit":             Auto;
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
    prefix:                 Bg;
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

export interface Ar extends ParameterType {
    expects:           The2_Element[];
}

export enum AvailableIn {
    Graph = "graph",
    Output = "output",
    URL = "url",
}

export interface The2_Element extends ExpectedValueDefinition {
    strict_range: MinimumNumberRange;
    type:         ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface Range {
    min?: number;
    max?: number;
}

export interface MinimumNumberRange extends Range {
    min: number;
}

export enum ExpectedValueType {
    Integer = "integer",
    Ratio = "ratio",
    UnitScalar = "unit_scalar",
    Number = "number",

    Boolean = "boolean",

    List = "list",
    Path = "path",
    String = "string",
    URL = "url",

    Font = "font",

    HexColor = "hex_color",
    ColorKeyword = "color_keyword",

    Timestamp = "timestamp"
}

export interface Auto extends ParameterType {
    default?:          string;
    expects:           AutoExpect[];
}

export interface AutoExpect extends ExpectedValueDefinition {
    possible_values?: string[];
    // TODO: This seems odd. Double-check this.
    type:             ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface Bg extends ParameterType {
    default?:          boolean | number | string;
    expects:           StringExpectation[];
}

export interface StringExpectation extends ExpectedValueDefinition{
    type: ExpectedValueType.String;
}

export interface BlendAlpha extends ParameterType {
    default?:          number;
    expects:           BlendAlphaExpect[];
}

export interface BlendAlphaExpect extends ExpectedValueDefinition {
    strict_range: MinMaxRange;
    type:         ExpectedValueType.Integer | ExpectedValueType.UnitScalar;
}

export interface MinMaxRange {
    max?: number;
    min:  number;
}

export interface BlendPad extends ParameterType {
    default?:          number;
    expects:           BlendPadExpect[];
}

export interface BlendPadExpect extends ExpectedValueDefinition {
    suggested_range: MinimumNumberRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Blur extends ParameterType {
    default?:          number;
    expects:           BlurExpect[];
}

export interface BlurExpect extends ExpectedValueDefinition {
    suggested_range: MinMaxRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Border extends ParameterType {
    expects:           BorderExpect[];
}

export interface BorderExpect extends ExpectedValueDefinition {
    "0":    BlurExpect[];
    "1":    StringExpectation[];
    length: number;
    type:   ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface BorderRadius extends ParameterType {
    expects:           BorderRadiusExpect[];
}

export interface BorderRadiusExpect extends ExpectedValueDefinition {
    "0"?:          The2_Element[];
    "1"?:          The2_Element[];
    "2"?:          The2_Element[];
    "3"?:          The2_Element[];
    length?:       number;
    strict_range?: MinimumNumberRange;
    type:          ExpectedValueType.String;
}

export interface Chromasub extends ParameterType {
    default?:          number;
    expects:           ChromasubExpect[];
}

export interface ChromasubExpect extends ExpectedValueDefinition {
    possible_values: number[];
    type:            ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface DPI extends ParameterType {
    expects:           BlendPadExpect[];
}

export interface Dpr extends ParameterType {
    default:           number;
    expects:           DprExpect[];
}

export interface DprExpect extends ExpectedValueDefinition {
    default?:        number;
    strict_range:    MinMaxRange;
    suggested_range: MinMaxRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Duotone extends ParameterType {
    expects:           DuotoneExpect[];
}

export interface DuotoneExpect extends ExpectedValueDefinition {
    "0":      StringExpectation[];
    "1":      StringExpectation[];
    default?: string;
    length:   number;
    type:     ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface FP extends ParameterType {
    expects:           FPXExpect[];
}

export interface FPXExpect extends ExpectedValueDefinition {
    default:      number;
    strict_range: MinMaxRange;
    type:         ExpectedValueType.Integer | ExpectedValueType.UnitScalar;
}

export interface Fpz extends ParameterType {
    expects:           DprExpect[];
}

export interface GridColors extends ParameterType {
    expects:           DuotoneExpect[];
}

export interface GridSize extends ParameterType {
    expects:           GridSizeExpect[];
}

export interface GridSizeExpect extends ExpectedValueDefinition {
    default:      number;
    strict_range: MinimumNumberRange;
    type:         ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface Mask extends ParameterType {
    expects:           AutoExpect[];
}

export interface PadBottom extends ParameterType {
    expects:           PadBottomExpect[];
}

export interface PadBottomExpect extends ExpectedValueDefinition {
    default:         number;
    suggested_range: MinimumNumberRange;
    type:            ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface Rect extends ParameterType {
    expects:           RectExpect[];
}

export interface RectExpect extends ExpectedValueDefinition {
    "0":    The0[];
    "1":    The0[];
    "2":    The2_Element[];
    "3":    The2_Element[];
    length: number;
    // TODO: This seems odd. Double-check this.
    type:   ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface The0 extends ExpectedValueDefinition{
    possible_values?: string[];
    strict_range?:    MinMaxRange;
    type:             ExpectedValueType.String;
}
