
// Packets

export type Packet = CPacket | SPacket
export type CSPacket = PacketUpdatePoint | PacketUpdateLayer | PacketRemoveLayer | PacketRemovePoint
export type CPacket = CSPacket | PacketViewReq
export type SPacket = CSPacket | PacketViewRes

export interface PacketUpdatePoint {
    type: "update-point",
    data: IPoint
}
export interface PacketRemovePoint {
    type: "remove-point"
    id: ID
}
export interface PacketUpdateLayer {
    type: "update-layer"
    data: ILayer
}
export interface PacketRemoveLayer {
    type: "remove-layer"
    id: ID
}
export interface PacketViewRes {
    type: "view-response",
    points: IPoint[]
}
export interface PacketViewReq {
    type: "view-request"
    rect: IRect
}


// Interfaces

export type ID = string
export interface IPoint {
    id: ID
    x: number
    y: number
    quad: ID
    index: number
    layer: ID
}

export interface ILayer {
    id: ID,
    priority: number
    style: ILayerStyle
}

export interface ILayerStyle {
    line_width: number
    stroke_color?: [number, number, number]
    fill_color?: [number, number, number]
}

export interface IRect {
    tl: { x: number, y: number },
    br: { x: number, y: number }
}
