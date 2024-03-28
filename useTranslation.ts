/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dashboard } from 'dashboard';
import { useCallback, useMemo } from 'react';

import { useLocaleContext } from 'context';
import { translationEN, translationFR } from 'messages';
import { Locales } from 'shared';

type TranslationsScopes = {
  common: Common;
  dashboard: Dashboard;
  settings: Settings;
};

type Common = typeof translationEN.default.commonEN;
type Dashboard = typeof translationEN.default.dashboardEN;
type Settings = typeof translationEN.default.settingsEN;

type TranslationsKeys = TranslationKeys<TranslationsScopes>;

type TranslationKeys<T extends Record<string, unknown>> = keyof {
  [K in keyof T as T[K] extends string // si la valeur de la clé est une string, on retourne la clé
    ? K // <---- string
    : T[K] extends Record<string, unknown> // si la clé est une string, et que la valeur n'est pas un string
      ? `${K & string}.${TranslationKeys<T[K]> & string}` // <---- on regarde recursivement dans la valeur pour trouver la prochaine clé
      : never]: string;
};

export const useTranslations = () => {
  const { locale } = useLocaleContext();

  const localizedTexts = useMemo(() => {
    const texts: { [locale in Locales]: TranslationsScopes } = {
      [Locales.en]: {
        common: translationEN.default.commonEN,
        dashboard: translationEN.default.dashboardEN,
        settings: translationEN.default.settingsEN,
      },
      [Locales.fr]: {
        common: translationFR.default.commonFR,
        dashboard: translationFR.default.dashboardFR,
        settings: translationFR.default.settingsFR,
      },
    };
    return texts[locale as Locales];
  }, [locale]);

  function get(
    obj: { [key: string]: any },
    path: string,
    defaultValue: string = '',
    args?: { [key: string]: string | undefined },
  ): any {
    const value =
      path.split('.').reduce((_obj, key) => (_obj || {})[key], obj) || `The key "${defaultValue}" doesn't exist`;

    if (args) {
      return Object.keys(args).reduce((acc, key) => acc.replace(`{{${key}}}`, args[key]), value);
    }
    return value;
  }

  const t = useCallback(
    (key: TranslationsKeys, args?: { [key: string]: string | undefined }): string => {
      return get(localizedTexts, key, key, args);
    },
    [localizedTexts],
  );

  return {
    t,
  };
};
