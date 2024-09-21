import Collapse from './Collapse';
import ModalWrapper from './GlobalModal/modalWrapper';
import bindRequest from './BindRequest';
import SvgIcon from './SvgIcon/index';
import CustomModal from './AntdModal';
import RulesEditor from './RulesSetting/RulesEditor';
import ButtonWithRules from './RulesSetting/button';
import CheckboxWithRules from './RulesSetting/checkbox';
import CodeTextArea from './CodeTextArea';
import DataSetting from './DataSetting';
import ValidatorSetting from './ValidatorSetting';

// `FormRender.components`
export const commonWidgets = {
  CodeTextArea,
  ValidatorSetting,
  DataSetting,
  CheckboxWithRules
};

export {
  Collapse,
  ModalWrapper,
  bindRequest,
  SvgIcon,
  CustomModal,
  RulesEditor,
  ButtonWithRules,
  CheckboxWithRules,
  CodeTextArea,
  DataSetting,
  ValidatorSetting,
};

export * from './GlobalModal/modalWrapper';
export * from './CodeMirror';
export * from './AntdModal';
export * from './RulesSetting/RulesEditor';
export * from './DataSetting';
export * from './ValidatorSetting';
