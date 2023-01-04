export interface Imgix {
    readonly aliases:            { [key: string]: string };
    readonly categoryValues:     Category[];
    readonly colorKeywordValues: string[];
    readonly fontValues:         string[];
    readonly parameters:         ImgixParameters;
    readonly version:            string;
}

/**
 * The format that parameters from the Imgix schema are defined
 */
export interface ParameterDefinition {
    /** An optional default value */
    default?:          boolean | number | string;
    /** Some parameters have aliases (e.g. width and "w") */
    aliases?:          string[];
    /** Defines where a parameter may be supplied. We don't use this. */
    available_in:      AvailableIn[];
    /** Defines the operation category */
    category:          Category;
    /** Parameters required by this parameter */
    depends?:          string[];
    /** A human-readable name */
    display_name:      string;
    /** Rules for the value supplied to this parameter */
    expects:           ParameterValueRule[];
    /** Human readable description */
    short_description: string;
    /** A reference URL. We don't use this */
    url?:               string;
}

export enum Category {
    SIZE = 'size',
    AUTO = 'auto',
    FILL = 'fill',
    BLENDING = 'blending',
    STYLIZE = 'stylize',
    BORDER_AND_PADDING = 'border-and-padding',
    ADJUSTMENT = 'adjustment',
    FORMAT = 'format',
    COLOR_PALETTE = 'color-palette',
    MASK = 'mask',
    PIXEL_DENSITY = 'pixel-density',
    EXPIRATION = 'expiration',
    FACE_DETECTION = 'face-detection',
    ROTATION = 'rotation',
    FOCALPOINT_CROP = 'focalpoint-crop',
    WATERMARK = 'watermark',
    NOISE_REDUCTION = 'noise-reduction',
    PDF = 'pdf',
    TRIM = 'trim',
    TEXT = 'text',
    TYPESETTING = 'typesetting',
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

export type ParameterValueRulePossibleValueTypes = string|number;

/**
 * Rules to be evaluated for supplied values to parameters
 */
export interface ParameterValueRule {
    default?: ParameterValueRulePossibleValueTypes;
    possible_values?: Array<ParameterValueRulePossibleValueTypes>;
    strict_range?: Range;
    suggested_range?: Range;
    type:         ExpectedValueType;
}

export interface ImgixParameters {
    ar?:                    Ar;
    auto?:                  Auto;
    bg?:                    Bg;
    blend?:                 Bg;
    "blend-align"?:         Auto;
    "blend-alpha"?:         BlendAlpha;
    "blend-color"?:         Bg;
    "blend-crop"?:          Auto;
    "blend-fit"?:            Auto;
    "blend-h"?:             BlendAlpha;
    "blend-mode"?:          Auto;
    "blend-pad"?:           BlendPad;
    "blend-size"?:          Auto;
    "blend-w"?:             BlendAlpha;
    "blend-x"?:             BlendPad;
    "blend-y"?:             BlendPad;
    blur?:                  Blur;
    border?:                Border;
    "border-bottom"?:       Blur;
    "border-left"?:         Blur;
    "border-radius"?:       BorderRadius;
    "border-radius-inner"?: BorderRadius;
    "border-right"?:        Blur;
    "border-top"?:          Blur;
    bri?:                   Blur;
    ch?:                    Auto;
    chromasub?:             Chromasub;
    colorquant?:            Blur;
    colors?:                Blur;
    con?:                   Blur;
    "corner-radius"?:       BorderRadius;
    crop?:                  Auto;
    cs?:                    Auto;
    dl?:                    Bg;
    dpi?:                   DPI;
    dpr?:                   Dpr;
    duotone?:               Duotone;
    "duotone-alpha"?:       BlendAlpha;
    exp?:                   Blur;
    expires?:               Bg;
    faceindex?:             BlendPad;
    facepad?:               Blur;
    faces?:                 Chromasub;
    fill?:                  Auto;
    "fill-color"?:          Bg;
    fit?:                   Auto;
    flip?:                  Auto;
    fm?:                    Auto;
    "fp-debug"?:            Bg;
    "fp-x"?:                FP;
    "fp-y"?:                FP;
    "fp-z"?:                Fpz;
    gam?:                   Blur;
    "grid-colors"?:         GridColors;
    "grid-size"?:           GridSize;
    h?:                     BlendAlpha;
    high?:                  Blur;
    htn?:                   Blur;
    hue?:                   Blur;
    invert?:                Bg;
    iptc?:                  Auto;
    lossless?:              Bg;
    mark?:                  Bg;
    "mark-align"?:          Auto;
    "mark-alpha"?:          Blur;
    "mark-base"?:           Bg;
    "mark-fit"?:             Auto;
    "mark-h"?:              BlendAlpha;
    "mark-pad"?:            BlendPad;
    "mark-rot"?:            Blur;
    "mark-scale"?:          Blur;
    "mark-tile"?:           Auto;
    "mark-w"?:              BlendAlpha;
    "mark-x"?:              BlendPad;
    "mark-y"?:              Ar;
    mask?:                  Mask;
    "mask-bg"?:             Bg;
    "max-h"?:               BlendAlpha;
    "max-w"?:               BlendAlpha;
    "min-h"?:               BlendAlpha;
    "min-w"?:               BlendAlpha;
    monochrome?:            Bg;
    nr?:                    Blur;
    nrs?:                   Blur;
    orient?:                Chromasub;
    pad?:                   BlendPad;
    "pad-bottom"?:          PadBottom;
    "pad-left"?:            PadBottom;
    "pad-right"?:           PadBottom;
    "pad-top"?:             PadBottom;
    page?:                  BlendPad;
    palette?:               Auto;
    "pdf-annotation"?:      Bg;
    prefix?:                 Bg;
    px?:                    Blur;
    q?:                     Blur;
    rect?:                  Rect;
    rot?:                   Blur;
    sat?:                   Blur;
    sepia?:                 Blur;
    shad?:                  Blur;
    sharp?:                 Blur;
    transparency?:          Auto;
    trim?:                  Auto;
    "trim-color"?:          Bg;
    "trim-md"?:             BlendPad;
    "trim-pad"?:            BlendPad;
    "trim-sd"?:             BlendPad;
    "trim-tol"?:            BlendPad;
    txt?:                   Bg;
    "txt-align"?:           Auto;
    "txt-clip"?:            Auto;
    "txt-color"?:           Bg;
    "txt-fit"?:             Auto;
    "txt-font"?:            Bg;
    "txt-lead"?:            BlendPad;
    "txt-lig"?:             Chromasub;
    "txt-line"?:            BlendPad;
    "txt-line-color"?:      Bg;
    "txt-pad"?:             PadBottom;
    "txt-shad"?:            Blur;
    "txt-size"?:            BlendPad;
    "txt-track"?:           BlendPad;
    "txt-width"?:           BlendPad;
    "txt-x"?:               Bg;
    "txt-y"?:               Bg;
    usm?:                   Blur;
    usmrad?:                BlendPad;
    vib?:                   Blur;
    w?:                     BlendAlpha;
}

export interface Ar extends ParameterDefinition {
    expects:           The2_Element[];
}

export enum AvailableIn {
    Graph = "graph",
    Output = "output",
    URL = "url",
}

export interface The2_Element extends ParameterValueRule {
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

export interface Auto extends ParameterDefinition {
    default?:          string;
    expects:           AutoExpect[];
}

export interface AutoExpect extends ParameterValueRule {
    possible_values?: string[];
    // TODO: This seems odd. Double-check this.
    type:             ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface Bg extends ParameterDefinition {
    default?:          boolean | number | string;
    expects:           StringExpectation[];
}

export interface StringExpectation extends ParameterValueRule{
    type: ExpectedValueType.String;
}

export interface BlendAlpha extends ParameterDefinition {
    default?:          number;
    expects:           BlendAlphaExpect[];
}

export interface BlendAlphaExpect extends ParameterValueRule {
    strict_range: MinMaxRange;
    type:         ExpectedValueType.Integer | ExpectedValueType.UnitScalar;
}

export interface MinMaxRange {
    max?: number;
    min:  number;
}

export interface BlendPad extends ParameterDefinition {
    default?:          number;
    expects:           BlendPadExpect[];
}

export interface BlendPadExpect extends ParameterValueRule {
    suggested_range: MinimumNumberRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Blur extends ParameterDefinition {
    default?:          number;
    expects:           BlurExpect[];
}

export interface BlurExpect extends ParameterValueRule {
    suggested_range: MinMaxRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Border extends ParameterDefinition {
    expects:           BorderExpect[];
}

export interface BorderExpect extends ParameterValueRule {
    "0":    BlurExpect[];
    "1":    StringExpectation[];
    length: number;
    type:   ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface BorderRadius extends ParameterDefinition {
    expects:           BorderRadiusExpect[];
}

export interface BorderRadiusExpect extends ParameterValueRule {
    "0"?:          The2_Element[];
    "1"?:          The2_Element[];
    "2"?:          The2_Element[];
    "3"?:          The2_Element[];
    length?:       number;
    strict_range?: MinimumNumberRange;
    type:          ExpectedValueType.String;
}

export interface Chromasub extends ParameterDefinition {
    default?:          number;
    expects:           ChromasubExpect[];
}

export interface ChromasubExpect extends ParameterValueRule {
    possible_values: number[];
    type:            ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface DPI extends ParameterDefinition {
    expects:           BlendPadExpect[];
}

export interface Dpr extends ParameterDefinition {
    default:           number;
    expects:           DprExpect[];
}

export interface DprExpect extends ParameterValueRule {
    default?:        number;
    strict_range:    MinMaxRange;
    suggested_range: MinMaxRange;
    type:            ExpectedValueType.Integer | ExpectedValueType.Number;
}

export interface Duotone extends ParameterDefinition {
    expects:           DuotoneExpect[];
}

export interface DuotoneExpect extends ParameterValueRule {
    "0":      StringExpectation[];
    "1":      StringExpectation[];
    default?: string;
    length:   number;
    type:     ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface FP extends ParameterDefinition {
    expects:           FPXExpect[];
}

export interface FPXExpect extends ParameterValueRule {
    default:      number;
    strict_range: MinMaxRange;
    type:         ExpectedValueType.Integer | ExpectedValueType.UnitScalar;
}

export interface Fpz extends ParameterDefinition {
    expects:           DprExpect[];
}

export interface GridColors extends ParameterDefinition {
    expects:           DuotoneExpect[];
}

export interface GridSize extends ParameterDefinition {
    expects:           GridSizeExpect[];
}

export interface GridSizeExpect extends ParameterValueRule {
    default:      number;
    strict_range: MinimumNumberRange;
    type:         ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface Mask extends ParameterDefinition {
    expects:           AutoExpect[];
}

export interface PadBottom extends ParameterDefinition {
    expects:           PadBottomExpect[];
}

export interface PadBottomExpect extends ParameterValueRule {
    default:         number;
    suggested_range: MinimumNumberRange;
    type:            ExpectedValueType.Ratio | ExpectedValueType.Integer;
}

export interface Rect extends ParameterDefinition {
    expects:           RectExpect[];
}

export interface RectExpect extends ParameterValueRule {
    "0":    The0[];
    "1":    The0[];
    "2":    The2_Element[];
    "3":    The2_Element[];
    length: number;
    // TODO: This seems odd. Double-check this.
    type:   ExpectedValueType.List | ExpectedValueType.Path | ExpectedValueType.String | ExpectedValueType.URL;
}

export interface The0 extends ParameterValueRule{
    possible_values?: string[];
    strict_range?:    MinMaxRange;
    type:             ExpectedValueType.String;
}
