import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

/*
  Hooks tipados de Redux. Usar siempre estos en lugar de
  useDispatch/useSelector directos para tener autocompletado y tipos.
*/
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
