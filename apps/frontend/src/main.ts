import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true,
  })
  .catch((err) => {
    console.error(err);
    const errorTemplate = document.getElementById(
      'error_template'
    ) as HTMLTemplateElement;
    document
      .querySelector('body')
      ?.appendChild(errorTemplate.content.cloneNode(true));
  });
