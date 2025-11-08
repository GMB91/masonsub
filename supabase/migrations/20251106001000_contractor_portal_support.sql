-- Migration: Contractor Portal Support (v1)
-- Description: Add contractor-specific tables and fields for the contractor portal system
-- Date: 2025-11-06

-- =====================================================
-- 1. UPDATE CLAIMANTS TABLE FOR CONTRACTOR WORKFLOW
-- =====================================================

-- Add contractor assignment and status tracking
ALTER TABLE claimants 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status_contractor VARCHAR(20) DEFAULT 'uncontacted' CHECK (status_contractor IN ('uncontacted', 'qualified', 'not_interested', 'follow_up_later')),
ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS contractor_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for contractor queries
CREATE INDEX IF NOT EXISTS idx_claimants_assigned_to ON claimants(assigned_to);
CREATE INDEX IF NOT EXISTS idx_claimants_contractor_status ON claimants(status_contractor);

-- =====================================================
-- 2. CONTRACTOR NOTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS contractor_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claimant_id UUID NOT NULL REFERENCES claimants(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one note per contractor per claimant
  UNIQUE(claimant_id, contractor_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contractor_notes_claimant ON contractor_notes(claimant_id);
CREATE INDEX IF NOT EXISTS idx_contractor_notes_contractor ON contractor_notes(contractor_id);

-- =====================================================
-- 3. SMS TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default SMS templates
INSERT INTO sms_templates (name, description, template_body, created_by) VALUES
('initial_contact', 'First contact introduction', 'Hi {{name}}, this is {{contractor_name}} from Mason Vector. We''re helping with your unclaimed money claim. Can you confirm your current address is {{address}}? Reply YES to confirm or call {{phone}}.', 
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('follow_up', 'Follow up message', 'Hi {{name}}, following up on your unclaimed money claim with Mason Vector. Please call us at {{phone}} when convenient to complete verification. Thanks!',
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('appointment_reminder', 'Appointment confirmation', 'Hi {{name}}, reminder of your appointment with Mason Vector on {{date}} at {{time}}. Please call {{phone}} if you need to reschedule.',
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1))
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. EMAIL TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  subject_line VARCHAR(200) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  template_variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, description, subject_line, html_body, text_body, template_variables) VALUES
('contractor_introduction', 'Introduction email from contractor to client', 
'Mason Vector - Unclaimed Money Assistance for {{name}}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mason Vector Introduction</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
        .footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">Mason Vector</h1>
        <p style="margin: 8px 0 0 0;">Professional Asset Recovery Services</p>
    </div>
    <div class="content">
        <p>Dear {{name}},</p>
        
        <p>I hope this email finds you well. My name is {{contractor_name}}, and I''m a verified representative working with Mason Vector to assist with unclaimed money recovery.</p>
        
        <p><strong>We have identified that you may be entitled to unclaimed funds.</strong></p>
        
        <p>To proceed with your claim, I need to verify some details with you:</p>
        <ul>
            <li>Confirm your current address: {{address}}</li>
            <li>Verify your contact information</li>
            <li>Discuss the next steps in the recovery process</li>
        </ul>
        
        <p>This is a legitimate service, and there are no upfront fees. We only collect our fee once your funds are successfully recovered.</p>
        
        <a href="tel:{{phone}}" class="button">Call Us: {{phone}}</a>
        
        <p>You can also reply to this email or call the number above at your convenience. I''m available Monday through Friday, 9 AM to 6 PM AEST.</p>
        
        <p>Thank you for your time, and I look forward to helping you recover these funds.</p>
        
        <p>Best regards,<br>
        {{contractor_name}}<br>
        Mason Vector Asset Recovery<br>
        Phone: {{phone}}<br>
        Email: {{contractor_email}}</p>
    </div>
    <div class="footer">
        <p>Mason Vector Pty Ltd | ABN: 00 000 000 000<br>
        This email was sent regarding unclaimed money that may belong to you. If you believe this was sent in error, please contact us.</p>
    </div>
</body>
</html>',
'Dear {{name}},

I hope this email finds you well. My name is {{contractor_name}}, and I''m a verified representative working with Mason Vector to assist with unclaimed money recovery.

We have identified that you may be entitled to unclaimed funds.

To proceed with your claim, I need to verify some details with you:
- Confirm your current address: {{address}}
- Verify your contact information  
- Discuss the next steps in the recovery process

This is a legitimate service, and there are no upfront fees. We only collect our fee once your funds are successfully recovered.

Please call me at {{phone}} or reply to this email at your convenience. I''m available Monday through Friday, 9 AM to 6 PM AEST.

Thank you for your time, and I look forward to helping you recover these funds.

Best regards,
{{contractor_name}}
Mason Vector Asset Recovery
Phone: {{phone}}
Email: {{contractor_email}}

---
Mason Vector Pty Ltd | ABN: 00 000 000 000
This email was sent regarding unclaimed money that may belong to you. If you believe this was sent in error, please contact us.',
'["name", "contractor_name", "contractor_email", "phone", "address"]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. MESSAGES TABLE (for SMS/Email logging)
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claimant_id UUID NOT NULL REFERENCES claimants(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('sms', 'email')),
  template_id UUID, -- References sms_templates or email_templates
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  subject VARCHAR(200), -- For emails
  message_body TEXT NOT NULL,
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  external_message_id VARCHAR(100), -- SMS gateway or email service ID
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Either phone or email must be present
  CONSTRAINT check_recipient CHECK (
    (message_type = 'sms' AND recipient_phone IS NOT NULL) OR
    (message_type = 'email' AND recipient_email IS NOT NULL)
  )
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_claimant ON messages(claimant_id);
CREATE INDEX IF NOT EXISTS idx_messages_contractor ON messages(contractor_id);
CREATE INDEX IF NOT EXISTS idx_messages_type_status ON messages(message_type, delivery_status);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on contractor tables
ALTER TABLE contractor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Contractors can only see their own notes
CREATE POLICY contractor_notes_isolation ON contractor_notes
  FOR ALL USING (
    contractor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Contractors can only see messages they sent or received
CREATE POLICY contractor_messages_isolation ON messages
  FOR ALL USING (
    contractor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
  );

-- Update claimants RLS policy to include contractor access
DROP POLICY IF EXISTS claimants_isolation ON claimants;
CREATE POLICY claimants_isolation ON claimants
  FOR ALL USING (
    -- Admin/Manager: See all
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    ) OR
    -- Contractor: See only assigned claimants
    (assigned_to = auth.uid() AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'contractor'
    )) OR
    -- Client: See only their own record
    (client_user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'client'
    ))
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update contractor notes with auto-save
CREATE OR REPLACE FUNCTION update_contractor_note(
  p_claimant_id UUID,
  p_note_text TEXT
) RETURNS JSONB AS $$
DECLARE
  v_contractor_id UUID;
  v_result JSONB;
BEGIN
  -- Get current contractor ID
  v_contractor_id := auth.uid();
  
  -- Verify contractor has access to this claimant
  IF NOT EXISTS (
    SELECT 1 FROM claimants 
    WHERE id = p_claimant_id 
    AND assigned_to = v_contractor_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  -- Insert or update note
  INSERT INTO contractor_notes (claimant_id, contractor_id, note_text, updated_at)
  VALUES (p_claimant_id, v_contractor_id, p_note_text, NOW())
  ON CONFLICT (claimant_id, contractor_id)
  DO UPDATE SET 
    note_text = EXCLUDED.note_text,
    updated_at = NOW();
  
  -- Log the action
  INSERT INTO audit_logs (actor_id, action, entity, entity_id, details, created_at)
  VALUES (
    v_contractor_id,
    'UPDATE_CONTRACTOR_NOTE',
    'contractor_note',
    p_claimant_id,
    jsonb_build_object('note_length', length(p_note_text)),
    NOW()
  );
  
  RETURN jsonb_build_object('success', true, 'updated_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update contractor status
CREATE OR REPLACE FUNCTION update_contractor_status(
  p_claimant_id UUID,
  p_status VARCHAR(20)
) RETURNS JSONB AS $$
DECLARE
  v_contractor_id UUID;
  v_old_status VARCHAR(20);
BEGIN
  -- Get current contractor ID
  v_contractor_id := auth.uid();
  
  -- Validate status
  IF p_status NOT IN ('qualified', 'not_interested', 'follow_up_later') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;
  
  -- Get old status and update
  UPDATE claimants 
  SET 
    status_contractor = p_status,
    contractor_updated_at = NOW(),
    last_contacted = CASE WHEN p_status != 'uncontacted' THEN NOW() ELSE last_contacted END
  WHERE id = p_claimant_id 
    AND assigned_to = v_contractor_id
  RETURNING status_contractor INTO v_old_status;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claimant not found or access denied');
  END IF;
  
  -- Log the status change
  INSERT INTO audit_logs (actor_id, action, entity, entity_id, details, created_at)
  VALUES (
    v_contractor_id,
    'UPDATE_CONTRACTOR_STATUS',
    'claimant',
    p_claimant_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status
    ),
    NOW()
  );
  
  RETURN jsonb_build_object('success', true, 'status', p_status, 'updated_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update contractor_updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_contractor_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.contractor_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to contractor_notes
DROP TRIGGER IF EXISTS contractor_notes_updated_at ON contractor_notes;
CREATE TRIGGER contractor_notes_updated_at
  BEFORE UPDATE ON contractor_notes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_contractor_timestamp();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON contractor_notes TO authenticated;
GRANT ALL ON sms_templates TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT EXECUTE ON FUNCTION update_contractor_note TO authenticated;
GRANT EXECUTE ON FUNCTION update_contractor_status TO authenticated;