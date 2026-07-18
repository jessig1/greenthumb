CREATE TABLE photo (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,
    entity_type     VARCHAR(20) NOT NULL CHECK (entity_type IN ('GARDEN', 'CONTAINER', 'PLANTED_PLANT')),
    entity_id       UUID NOT NULL,
    object_key      VARCHAR(512) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    caption         VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photo_entity ON photo (entity_type, entity_id);
CREATE INDEX idx_photo_owner_id ON photo (owner_id);
