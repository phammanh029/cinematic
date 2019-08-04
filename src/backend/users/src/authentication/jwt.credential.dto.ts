interface JWTCredentialDto {
    rsa_public_key?: string;
    consumer_id: string;
    algorithm?: string;
    created_at: number;
    id: string;
    key: string;
    secret: string;
}

export default JWTCredentialDto;
