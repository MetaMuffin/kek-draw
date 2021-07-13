
// Packets

export type Packet = CPacket | SPacket
export type CSPacket = PacketUpdatePoint | PacketUpdateLayer | PacketRemoveLayer | PacketRemovePoint
export type CPacket = CSPacket | PacketFetchLayer | PacketFetchPoint
export type SPacket = CSPacket

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
export interface PacketFetchPoint {
    type: "fetch-point"
    rect: IRect
}
export interface PacketFetchLayer {
    type: "fetch-layer",
    id: ID
}


// Interfaces

export type ID = number
export interface IPoint {
    id: ID
    x: number
    y: number
    quad: ID
    order: number
    stroke: ID
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
