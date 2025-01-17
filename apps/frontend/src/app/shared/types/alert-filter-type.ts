import { SeverityType } from "../enums/severityType";

export type AlertFilterParams = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  severity?: SeverityType | null;
  fromDate?: string | null;
  toDate?: string | null;
  id?: string | null;
  alertType?: string | null;
  includeDeprecated?: boolean | null
};  