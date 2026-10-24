CREATE TABLE qa_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title varchar(100) NOT NULL,
 messages jsonb NOT NULL DEFAULT '[]'::jsonb,
 revision integer NOT NULL DEFAULT 0,
 archived boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT qa_conversations_messages_array CHECK (jsonb_typeof(messages) = 'array' AND jsonb_array_length(messages) <= 200)
);
CREATE INDEX qa_conversations_user_updated_idx ON qa_conversations(user_id, updated_at DESC, id DESC);
