import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamplesController } from './examples.controller';
import { ExamplesService } from './examples.service';
import { Examples, ExamplesSchema } from './examples.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Examples.name, schema: ExamplesSchema },
    ]),
    // MongooseModule.forFeatureAsync([
    //   {
    //     name: Examples.name,
    //     useFactory: () => {
    //       const schema = ExamplesSchema;
    //       schema.pre('save', function () {
    //         this.populate({ path: 'category', select: 'name' });
    //       });
    //       schema.pre(/^find/, function () {
    //         const query = this as mongoose.Query<any, any>;
    //         query.populate({ path: 'category', select: 'name' });
    //       });
    //       return schema;
    //     },
    //   },
    // ]),
  ],
  controllers: [ExamplesController],
  providers: [ExamplesService],
})
export class ExamplesModule {}
