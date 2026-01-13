import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';


@Injectable()
export default class ModelService {
  readonly client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);
}
