/**  keys you know + an index‑signature for the unknowns you discover at runtime */
export interface BigRow {
    // ==========   email   ==========
    Email_Id?: string;
    Email_Subject?: string;
    Email_Body?: string;
    Email_CreatedDate?: string;
    Email_From?: string;
  
    // ==========   content   =========
    ContentVersionId?: string;
    ContentDocumentId?: string;
  
    // ==========   case   ========== 
    Case_Id?: string;
    Case_AccountId?: string;
    Case_ContactId?: string;
    Case_CaseNumber?: string;
    Case_ContactEmail?: string;
    Case_Origin?: string;
    Case_Subject?: string;
    Case_Description?: string;
    Case_LastModifiedDate?: string;
    Case_IsClosed?: boolean;
    Case_Order_Number__c?: string;
    Case_SourceId?: string;
    Case_Receiving_Customer__c?: string;
  
    /**  any additional fields you didn’t enumerate */
    [key: string]: unknown;
  }