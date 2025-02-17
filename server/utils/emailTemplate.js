export const generateEmailTemplate = (otpCode) => {
  return `
    <div style="margin:0px auto;padding:0px">
    <img width="1" height="1" src="https://ci3.googleusercontent.com/meips/ADKq_NYicn2ZlOlEtm6bUMG46eS1OPjrVxFr5eOxb_zMc_NrhqxhA8FTu1jX3E7hfFaGaF3tw23glr_4lwBZXLf0j-1sDMH2odSvTp13OifPlFOebNu_U_4w9Iykm1_aj1CiTD8jUED7QqPEUZSHgGNcZRlPlEcWmvURqmWXMJemZJxBuaNYqSoRUjMtdtOmxwGDOZvwvhuFcJWt53Wh1HDKnzVBP--hygfIng=s0-d-e1-ft#https://twitter.com/scribe/ibis?t=1&amp;cn=b25ib2FyZGluZ192ZXJpZnlfZW1haWw%3D&amp;iid=62d72edf9eab4e33992e8b1d39e74638&amp;uid=1044315199879229441&amp;nid=296+20" style="margin:0px;padding:0px;display:inline-block;border:none;outline:none" class="CToWUd" data-bit="iit">
    
    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#ffffff" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto; padding-bottom:20px">
    <tbody>
    <tr>
    <td width="100%" align="center" style="padding:0px;margin:0px auto;font-size:0px;line-height:1px;padding:0px">
    <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#F5F8FA" width="100%" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto">
    <tbody>
    <tr>
    <td style="padding:0px;margin:0px auto;font-size:0px;line-height:1px;padding:0px">
    <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#ffffff" width="450" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto">
    <tbody>
    <tr>
    <td width="24" style="padding:0px;margin:0px auto;font-size:0px;line-height:1px;padding:0px"> &nbsp; </td>
    <td style="padding:0px;margin:0px auto;font-size:0px;line-height:1px;padding:0px">
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto">
    <tbody>
    <tr>
    <td height="24"> &nbsp; </td>
    </tr>
    <tr>
    <td align="right">
      <img src="https://imgur.com/cMB3wIC.png" width="32" alt="X" title="X" style="border:none; outline:none;">
    </td>
    </tr>
    <tr>
    <td height="24"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;font-weight:bold;line-height:32px"> Confirm your email address </td>
    </tr>
    <tr>
    <td height="24"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px">
    There’s one quick step you need to complete before creating your Note account. Let’s make sure this is the right email address for you — please confirm this is the right address to use for your new account.
    </td>
    </tr>
    <tr>
    <td height="24"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px"> Please enter this verification code to get started on Note: </td>
    </tr>
    <tr>
    <td height="10"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:32px;font-weight:bold;line-height:36px"> ${otpCode} </td>
    </tr>
    <tr>
    <td height="6"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:14px;line-height:18px"> Verification codes expire after two hours. </td>
    </tr>
    <tr>
    <td height="24"> &nbsp; </td>
    </tr>
    <tr>
    <td align="left" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:16px;line-height:22px"> Thanks,<br> Note </td>
    </tr>
    <tr class="m_893656338606245807hide">
    <td height="32"> &nbsp; </td>
    </tr>
    </tbody>
    </table> 
    </td>
    <td width="24"> &nbsp; </td>
    </tr>
    </tbody>
    </table>
    
    <!-- Footer -->
    <table cellpadding="0" cellspacing="0" border="0" align="center" width="450" bgcolor="#ffffff" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto">
    <tbody>
    <tr>
    <td width="24"> &nbsp; </td>
    <td>
    <table align="center" style="padding:0px;line-height:1px;font-size:1px;margin:0px auto">
    <tbody>
    <tr>
    <td height="48"> &nbsp; </td>
    </tr>
    <tr>
    <td align="center" style="color:#657786;font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:12px;font-weight:bold;text-align:center;margin:auto"> 
      <a href="https://support.x.com" style="text-decoration:none;color:#8899a6"> Help </a> &nbsp;|&nbsp; 
      <a href="https://support.x.com/articles/fake-twitter-emails" style="text-decoration:none;color:#8899a6"> Email security tips </a> 
    </td>
    </tr>
    <tr>
    <td height="12"> &nbsp; </td>
    </tr>
    <tr>
    <td align="center" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:12px;text-align:center;margin:auto;color:#8899a6"> 
      Note / Saigon  
    </td>
    </tr>
    <tr>
    <td height="50"> &nbsp; </td>
    </tr>
    </tbody>
    </table> 
    </td>
    <td width="24"> &nbsp; </td>
    </tr>
    </tbody>
    </table>
    <tr>
    <td height="20" style=bgcolor="#F5F8FA"></td>
    </tr>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    
      `;
};
// <td align="center" style="font-family:'Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:12px;text-align:center;margin:auto;color:#8899a6">
//   Note Corp. 1355 Market Street, Suite 900, San Francisco, CA 94103
// </td>
