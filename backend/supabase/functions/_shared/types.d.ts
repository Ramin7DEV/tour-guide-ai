// Ambient declarations to make Supabase Edge runtime types available in editors

declare module "npm:@supabase/supabase-js@2" {
  export interface SupabaseQueryResult<T> {
    data: T | null;
    error: { message: string } | null;
  }

  export interface SupabaseQueryBuilder<T> {
    select(columns: string): SupabaseQueryBuilder<T>;
    in(column: string, values: string[]): Promise<SupabaseQueryResult<T>>;
  }

  export interface SupabaseClient<Database = unknown> {
    from<TableName extends string>(
      table: TableName,
    ): SupabaseQueryBuilder<Database>;
  }

  export function createClient<Database = unknown>(
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ): SupabaseClient<Database>;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (
    handler: (req: Request) => Response | Promise<Response>,
    options?: unknown,
  ) => void;
};
