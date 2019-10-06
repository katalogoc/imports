import jwt from 'jsonwebtoken';
import { trim, partialRight } from 'lodash';
import { compose } from 'lodash/fp';
import config from './config';

export default {
  verify: (options = {}) => (token: string) => jwt.verify(token, config.get('JWT_SECRET'), options),
  signin: (options = {}) => (payload: object) => {
    const opt = {
      ...options,
      expiresIn: '1h',
    };

    return jwt.sign(payload, config.get('JWT_SECRET'), opt);
  },
  decode: (options = {}) => (token: string) => {
    const decodeToken = compose(
      partialRight(jwt.decode, options),
      trim
    );

    return decodeToken(token);
  },
};
