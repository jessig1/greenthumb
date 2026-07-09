ALTER TABLE app_user ALTER COLUMN cognito_sub DROP NOT NULL;
ALTER TABLE app_user ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE app_user ADD CONSTRAINT uq_app_user_email UNIQUE (email);
