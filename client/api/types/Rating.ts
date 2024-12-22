export interface ListResponse {
    rating?: number
    count?: number
    vote?: number | null
}

export interface PutRequest {
    place: string
    score: number
}

export interface PutResponse {
    rating: number
}
